"""
LangGraph-based travel planner with multi-agent workflows.
Uses LangGraph for stateful agent orchestration.
"""
import logging
from typing import Dict, Any, Optional, TypedDict, Annotated
from datetime import datetime, timedelta
import uuid
import json

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

from config import settings
from services.amadeus_service import amadeus_service

logger = logging.getLogger(__name__)


class PlannerState(TypedDict):
    """State for the LangGraph planner."""
    messages: Annotated[list, add_messages]
    city: str
    country: str
    days: int
    budget: Optional[float]
    preferences: Optional[list[str]]
    user_id: Optional[str]
    itinerary: Optional[Dict[str, Any]]
    run_id: str


class LangGraphPlanner:
    """
    Travel planner using LangGraph for multi-agent orchestration.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            api_key=settings.openai_api_key
        )
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        workflow = StateGraph(PlannerState)
        
        # Add nodes
        workflow.add_node("researcher", self._research_node)
        workflow.add_node("planner", self._plan_node)
        workflow.add_node("enricher", self._enrich_node)
        
        # Define edges
        workflow.set_entry_point("researcher")
        workflow.add_edge("researcher", "planner")
        workflow.add_edge("planner", "enricher")
        workflow.add_edge("enricher", END)
        
        return workflow.compile()
    
    def _research_node(self, state: PlannerState) -> PlannerState:
        """Research phase: Gather destination information."""
        logger.info(f"[{state['run_id']}] Research phase: {state['city']}, {state['country']}")
        
        research_prompt = f"""Research the following destination:
- City: {state['city']}
- Country: {state['country']}
- Trip duration: {state['days']} days
- Budget: ${state.get('budget', 'flexible')}
- Preferences: {state.get('preferences', 'none')}

Provide key insights about:
1. Top attractions and landmarks
2. Local culture and customs
3. Best times to visit
4. Transportation options
5. Food and dining highlights
6. Safety considerations

Format as JSON with these insights."""
        
        messages = [
            SystemMessage(content="You are a travel research expert."),
            HumanMessage(content=research_prompt)
        ]
        
        response = self.llm.invoke(messages)
        research_data = response.content
        
        # Store research in messages
        state["messages"].append(HumanMessage(content=research_prompt))
        state["messages"].append(response)
        
        return state
    
    def _plan_node(self, state: PlannerState) -> PlannerState:
        """Planning phase: Create detailed itinerary."""
        logger.info(f"[{state['run_id']}] Planning phase")
        
        # Get real travel data from Amadeus
        flight_data = None
        hotel_data = None
        
        if amadeus_service.is_available():
            try:
                airport_code = amadeus_service.get_airport_code(state['city'], state['country'])
                if airport_code:
                    # Get flights (example: from a major hub)
                    flight_data = amadeus_service.search_flights(
                        origin="JFK",  # Could be made configurable
                        destination=airport_code,
                        departure_date=(datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
                        return_date=(datetime.now() + timedelta(days=30 + state['days'])).strftime("%Y-%m-%d")
                    )
                    
                    # Get hotels
                    hotel_data = amadeus_service.search_hotels(
                        city_code=airport_code,
                        check_in=(datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
                        check_out=(datetime.now() + timedelta(days=30 + state['days'])).strftime("%Y-%m-%d")
                    )
            except Exception as e:
                logger.warning(f"Amadeus data fetch failed: {e}")
        
        plan_prompt = f"""Based on the research, create a detailed {state['days']}-day itinerary for {state['city']}, {state['country']}.

Requirements:
- Day-by-day schedule from 7 AM to 8 PM
- Specific place names (museums, restaurants, stores) - NOT just neighborhoods
- No duplicate locations
- Format: "Place Name, City"
- Include breakfast, lunch, and dinner activities
- Exactly 10 top recommended places (separate from daily schedule)
- Hour-by-hour activities with locations and durations

Flight data: {json.dumps(flight_data) if flight_data else 'Not available'}
Hotel data: {json.dumps(hotel_data) if hotel_data else 'Not available'}

Return as JSON with this structure:
{{
  "title": "Trip title",
  "description": "Brief overview",
  "top_10_places": ["Place 1, City", "Place 2, City", ...],
  "daily_schedule": [
    {{
      "day": 1,
      "theme": "Day theme",
      "activities": [
        {{"time": "7:00 AM", "activity": "Breakfast", "location": "Restaurant Name, City", "duration": "1 hour"}},
        ...
      ],
      "walking": "5 km",
      "tip": "Daily tip"
    }}
  ],
  "highlights": ["Highlight 1", "Highlight 2"],
  "local_tips": ["Tip 1", "Tip 2"],
  "compliance": {{
    "visa_required": false,
    "safety_level": "safe",
    "vaccinations": []
  }},
  "estimated_costs": {{
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "transport": 0,
    "total": 0
  }}
}}"""
        
        messages = state["messages"] + [
            SystemMessage(content="You are an expert travel planner. Create detailed, realistic itineraries."),
            HumanMessage(content=plan_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Parse JSON response
        try:
            content = response.content
            # Extract JSON from markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            itinerary = json.loads(content)
            state["itinerary"] = itinerary
        except Exception as e:
            logger.error(f"Failed to parse itinerary JSON: {e}")
            state["itinerary"] = {"error": "Failed to parse itinerary"}
        
        state["messages"].append(HumanMessage(content=plan_prompt))
        state["messages"].append(response)
        
        return state
    
    def _enrich_node(self, state: PlannerState) -> PlannerState:
        """Enrichment phase: Add final touches and validation."""
        logger.info(f"[{state['run_id']}] Enrichment phase")
        
        if not state.get("itinerary"):
            return state
        
        enrich_prompt = f"""Review and enhance this itinerary:
{json.dumps(state['itinerary'], indent=2)}

Add:
- Practical logistics tips
- Weather considerations
- Cultural etiquette notes
- Emergency contact info
- Packing suggestions

Return the enhanced itinerary as JSON."""
        
        messages = state["messages"] + [
            SystemMessage(content="You are a travel experience enhancer."),
            HumanMessage(content=enrich_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        try:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            enhanced = json.loads(content)
            state["itinerary"].update(enhanced)
        except Exception as e:
            logger.warning(f"Enrichment parsing failed: {e}")
        
        return state
    
    async def generate_itinerary(
        self,
        city: str,
        country: str,
        days: int,
        budget: Optional[float] = None,
        preferences: Optional[list[str]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate itinerary using LangGraph workflow.
        """
        run_id = str(uuid.uuid4())
        logger.info(f"[{run_id}] LangGraph: Generating {days}-day trip to {city}, {country}")
        
        initial_state: PlannerState = {
            "messages": [],
            "city": city,
            "country": country,
            "days": days,
            "budget": budget,
            "preferences": preferences or [],
            "user_id": user_id,
            "itinerary": None,
            "run_id": run_id
        }
        
        # Run the graph
        try:
            final_state = self.graph.invoke(initial_state)
            itinerary = final_state.get("itinerary", {})
            
            # Format response similar to SimplePlanner
            return {
                "run_id": run_id,
                "tour": itinerary,
                "cost": itinerary.get("estimated_costs", {}),
                "citations": [],
                "status": "completed"
            }
        except Exception as e:
            logger.error(f"LangGraph execution failed: {e}", exc_info=True)
            raise

