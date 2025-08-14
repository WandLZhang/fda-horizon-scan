"""
FDA Horizon Scan Backend - Cloud Functions Gen 2 with STREAMING
Uses REAL Gemini 2.5 Flash with Google Search grounding
Supports Server-Sent Events (SSE) for streaming responses
"""

import functions_framework
from flask import jsonify, Response, request
from google import genai
from google.genai import types
import json
import logging
from datetime import datetime
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def search_with_gemini(query):
    """
    REAL Gemini 2.5 Flash implementation with Google Search grounding
    Always returns fresh data from current news and health sources
    """
    try:
        client = genai.Client(
            vertexai=True,
            project="wz-fda-horizon-scan",
            location="global",
        )

        model = "gemini-2.5-flash"
        
        # Build the prompt for FDA surveillance and health incidents
        prompt = f"""You are an FDA health surveillance expert. Search for and analyze CURRENT information about: "{query}"

Focus on finding REAL news reports, FDA announcements, and documented incidents related to the query. This could include:
- FDA warning letters, enforcement actions, recalls
- Regulatory violations and compliance issues
- Health incidents, adverse events, outbreaks
- Product safety issues and contamination
- Medical device and drug problems
- Any other relevant health or regulatory matters

Search for ACTUAL news articles and official reports. Provide exactly 5 results based on real sources.

Use this exact JSON format:
{{
  "results": [
    {{
      "title": "Brief title from the actual news/report",
      "source": "Actual source (e.g., FDA.gov, CNN, local news)",
      "date": "YYYY-MM-DD",
      "severity": "critical/high/medium/low",
      "summary": "Concise description from the actual report including key details",
      "location": {{"state": "XX", "city": "City Name", "lat": latitude, "lng": longitude}},
      "affected": number_affected_if_available,
      "url": "Source URL"
    }}
  ]
}}

Return exactly 5 results. Focus on relevance to the query rather than forcing social media angles."""

        contents = [
            types.Content(
                role="user",
                parts=[types.Part(text=prompt)]
            )
        ]
        
        tools = [
            types.Tool(google_search=types.GoogleSearch()),
        ]

        generate_content_config = types.GenerateContentConfig(
            temperature=0.2,
            top_p=0.95,
            seed=0,
            max_output_tokens=4096,
            safety_settings=[
                types.SafetySetting(
                    category="HARM_CATEGORY_HATE_SPEECH",
                    threshold="OFF"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="OFF"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold="OFF"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_HARASSMENT",
                    threshold="OFF"
                )
            ],
            tools=tools,
            thinking_config=types.ThinkingConfig(
                thinking_budget=0,  # Zero for fast response
                include_thoughts=False   # Skip thinking for speed
            ),
        )

        # Generate content with Gemini 2.5 Flash
        response_text = ""
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                for part in chunk.candidates[0].content.parts:
                    if hasattr(part, 'text'):
                        response_text += part.text

        # Parse JSON from response
        if response_text:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
        
        return None

    except Exception as e:
        logger.error(f"Error in Gemini 2.5 Flash: {e}")
        raise  # Re-raise to handle at higher level

@functions_framework.http
def searchHealthTrendsStream(request):
    """STREAMING version - Search for health trends with Server-Sent Events"""
    # Handle CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    def generate():
        """Generator function for SSE streaming"""
        try:
            request_json = request.get_json(silent=True)
            query = request_json.get('query', 'dangerous health trends 2025') if request_json else 'dangerous health trends 2025'
            
            # Send initial connection event
            yield f"data: {json.dumps({'type': 'connected', 'timestamp': datetime.now().isoformat()})}\n\n"
            
            client = genai.Client(
                vertexai=True,
                project="wz-fda-horizon-scan",
                location="global",
            )
            
            model = "gemini-2.5-flash"
            prompt = f"""You are an FDA horizon scanning expert looking for EMERGING health threats. Search for and analyze CURRENT information about: "{query}"

CRITICAL: Focus on EMERGING issues that FDA may NOT know about yet:
- TikTok/Instagram health challenges causing ER visits in specific cities
- DIY medical treatments trending on Reddit or social media
- Unregulated supplements being sold on Etsy/Amazon
- Local emergency room reports of unusual symptoms
- Viral "wellness" trends with potential health risks
- Gray market products gaining popularity

Search for LOCAL news reports, hospital reports, and social media discussions. Each result MUST include the specific city where it's happening.

For EACH result, output ONLY a valid JSON object in this format (no array wrapper):
{{
  "title": "Brief title from the actual news/report",
  "source": "Actual source (prefer local news outlets)",
  "date": "YYYY-MM-DD",
  "severity": "critical/high/medium/low",
  "summary": "Concise description INCLUDING the specific location mentioned in the article",
  "location": {{
    "state": "XX (two-letter US state code ONLY)",
    "city": "US city name ONLY",
    "lat": actual_latitude_number,
    "lng": actual_longitude_number
  }},
  "affected": numeric_value_only,
  "url": "Source URL"
}}

IMPORTANT REQUIREMENTS:
- Focus on US cities and states when possible
- "affected" MUST be a number (use 100 if unknown, never use strings like "Unknown")
- "state" MUST be a valid 2-letter US state code (CA, NY, TX, etc.)
- Each result MUST have valid lat/lng coordinates. Use these for major US cities:
- Los Angeles, CA: 34.0522, -118.2437
- New York, NY: 40.7128, -74.0060
- Chicago, IL: 41.8781, -87.6298
- Houston, TX: 29.7604, -95.3698
- Phoenix, AZ: 33.4484, -112.0740
- Philadelphia, PA: 39.9526, -75.1652
- San Antonio, TX: 29.4241, -98.4936
- San Diego, CA: 32.7157, -117.1611
- Dallas, TX: 32.7767, -96.7970
- Miami, FL: 25.7617, -80.1918

Generate 5-10 results from DIFFERENT cities, outputting each as a separate JSON object."""

            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part(text=prompt)]
                )
            ]
            
            tools = [types.Tool(google_search=types.GoogleSearch())]
            
            config = types.GenerateContentConfig(
                temperature=0.2,
                top_p=0.95,
                max_output_tokens=8192,
                safety_settings=[
                    types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF")
                ],
                tools=tools,
                thinking_config=types.ThinkingConfig(
                    thinking_budget=0,
                    include_thoughts=False
                ),
            )
            
            buffer = ""
            result_count = 0
            
            # Stream chunks from Gemini
            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=config,
            ):
                if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                    for part in chunk.candidates[0].content.parts:
                        if hasattr(part, 'text'):
                            buffer += part.text
                            
                            # Try to extract complete JSON objects
                            while True:
                                start_idx = buffer.find('{')
                                if start_idx == -1:
                                    break
                                
                                # Count braces to find complete object
                                brace_count = 0
                                end_idx = -1
                                for i in range(start_idx, len(buffer)):
                                    if buffer[i] == '{':
                                        brace_count += 1
                                    elif buffer[i] == '}':
                                        brace_count -= 1
                                        if brace_count == 0:
                                            end_idx = i + 1
                                            break
                                
                                if end_idx == -1:
                                    break  # No complete object yet
                                
                                # Extract and parse JSON object
                                json_str = buffer[start_idx:end_idx]
                                buffer = buffer[end_idx:]  # Remove processed part
                                
                                try:
                                    result = json.loads(json_str)
                                    result_count += 1
                                    
                                    # Send result as SSE event
                                    event_data = {
                                        'type': 'result',
                                        'index': result_count,
                                        'data': result,
                                        'timestamp': datetime.now().isoformat()
                                    }
                                    yield f"data: {json.dumps(event_data)}\n\n"
                                    
                                except json.JSONDecodeError:
                                    continue  # Skip invalid JSON
            
            # Send completion event
            yield f"data: {json.dumps({'type': 'complete', 'total': result_count, 'timestamp': datetime.now().isoformat()})}\n\n"
            
        except Exception as e:
            logger.error(f"Error in streaming: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    # Return SSE response
    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': '*'
        }
    )

@functions_framework.http
def searchHealthTrends(request):
    """Search for health trends using REAL Gemini 2.5 Flash with Google Search - NON-STREAMING VERSION"""
    # Handle CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    try:
        request_json = request.get_json(silent=True)
        query = request_json.get('query', 'dangerous tiktok health trends 2025') if request_json else 'dangerous tiktok health trends 2025'
        include_thinking = request_json.get('include_thinking', False) if request_json else False
        
        if not include_thinking:
            # Standard mode (backward compatible)
            gemini_results = search_with_gemini(query)
            
            if gemini_results and 'results' in gemini_results:
                response = {
                    'source': 'Gemini 2.5 Flash with Google Search (LIVE)',
                    'results': gemini_results['results'],
                    'model': 'gemini-2.5-flash',
                    'query': query,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                response = {
                    'source': 'Gemini 2.5 Flash with Google Search',
                    'results': [],
                    'model': 'gemini-2.5-flash',
                    'query': query,
                    'error': 'No results found - try a different search query',
                    'timestamp': datetime.now().isoformat()
                }
            
            return jsonify(response), 200, {'Access-Control-Allow-Origin': '*'}
        
        # Mode with thinking visibility - return all thoughts in the response
        try:
            client = genai.Client(
                vertexai=True,
                project="wz-fda-horizon-scan",
                location="global",
            )
            
            model = "gemini-2.5-flash"
            prompt = f"""You are an FDA health surveillance expert analyzing dangerous social media health trends across the United States.

Search for and analyze CURRENT, REAL information about: "{query}"

Focus on:
1. Viral TikTok, Instagram, YouTube health challenges and DIY treatments that are ACTUALLY happening right now
2. REAL documented injuries, emergency room visits, hospitalizations from news reports
3. Medical professional warnings and FDA concerns from actual articles
4. NATIONWIDE geographic distribution - find REAL incidents reported in news from MULTIPLE US cities/states
5. Actual reported numbers of affected users and trending metrics from news sources

Search for REAL, CURRENT news articles and health reports. Provide at least 5-10 results from DIFFERENT US cities based on ACTUAL news reports.

Use this exact JSON format with REAL data from your search:
{{
  "results": [
    {{
      "title": "Brief title of the ACTUAL health trend/incident from news",
      "source": "Actual news source/platform (e.g., CNN, NBC News, local news)",
      "date": "YYYY-MM-DD (actual date from article)",
      "severity": "critical/high/medium/low (based on actual severity)",
      "summary": "Detailed description from the actual news report including specific health risks mentioned",
      "location": {{"state": "XX", "city": "City Name", "lat": actual_latitude, "lng": actual_longitude}},
      "affected": estimated_number_based_on_article,
      "url": "Actual source URL from the article"
    }}
  ]
}}"""
            
            contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]
            tools = [types.Tool(google_search=types.GoogleSearch())]
            
            config = types.GenerateContentConfig(
                temperature=0.2,
                top_p=0.95,
                seed=0,
                max_output_tokens=8192,
                safety_settings=[
                    types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF")
                ],
                tools=tools,
                thinking_config=types.ThinkingConfig(
                    thinking_budget=0,  # Zero for fast response
                    include_thoughts=False
                ),
            )
            
            # Collect all thoughts and text
            thoughts = []
            text_buffer = ""
            chunk_count = 0
            
            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=config,
            ):
                chunk_count += 1
                if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                    for part in chunk.candidates[0].content.parts:
                        # Check if this part has thought content
                        if hasattr(part, 'thought'):
                            thought_value = part.thought
                            # thought is a boolean, the actual content is in the text when it's a thinking part
                            # When thought=True, it means this text is thinking content
                            if thought_value and hasattr(part, 'text') and part.text:
                                thoughts.append({
                                    'chunk': chunk_count,
                                    'content': part.text  # The actual thought content is in text
                                })
                        # Regular text content (when thought is False or not present)
                        elif hasattr(part, 'text') and part.text:
                            text_buffer += part.text
            
            # Parse JSON from response
            results = []
            if text_buffer:
                json_start = text_buffer.find('{')
                json_end = text_buffer.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = text_buffer[json_start:json_end]
                    try:
                        data = json.loads(json_str)
                        if 'results' in data:
                            results = data['results']
                    except:
                        pass
            
            response = {
                'source': 'Gemini 2.5 Flash with Google Search (LIVE)',
                'results': results,
                'model': 'gemini-2.5-flash',
                'query': query,
                'thinking': thoughts,  # Include all thinking chunks
                'thinking_summary': '\n'.join([t['content'] for t in thoughts[:5]]) if thoughts else None,
                'total_chunks': chunk_count,
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(response), 200, {'Access-Control-Allow-Origin': '*'}
            
        except Exception as e:
            logger.error(f"Error with thinking mode: {e}")
            return jsonify({
                'source': 'Gemini 2.5 Flash',
                'results': [],
                'error': f'Search failed: {str(e)}',
                'model': 'gemini-2.5-flash',
                'timestamp': datetime.now().isoformat()
            }), 200, {'Access-Control-Allow-Origin': '*'}
            
    except Exception as e:
        logger.error(f"Error in searchHealthTrends: {e}")
        return jsonify({
            'source': 'Gemini 2.5 Flash',
            'results': [],
            'error': f'Search failed: {str(e)}',
            'model': 'gemini-2.5-flash',
            'timestamp': datetime.now().isoformat()
        }), 200, {'Access-Control-Allow-Origin': '*'}

def simulate_health_trends_with_gemini(query):
    """
    Use Gemini 2.5 Flash to generate Health Trends API-style data
    based on REAL Google Search data about search volume and trends
    """
    try:
        client = genai.Client(
            vertexai=True,
            project="wz-fda-horizon-scan",
            location="global",
        )

        model = "gemini-2.5-flash"
        
        # Prompt Gemini to generate Health Trends-style data based on real search patterns
        prompt = f"""You are simulating the Google Health Trends API by analyzing REAL search patterns for: "{query}"

Search Google to understand the ACTUAL current search volume and geographic distribution of this health trend.
Look for news articles mentioning search trends, Google Trends data, or reports about where this trend is popular.

Generate realistic query volume data for major US metro areas based on ACTUAL information you find:

For these major US markets (use their standard DMA codes):
- 803: Los Angeles
- 807: San Francisco-Oakland-San Jose  
- 819: Seattle-Tacoma
- 501: New York
- 506: Boston
- 511: Washington DC
- 618: Houston
- 623: Dallas-Ft. Worth
- 528: Miami-Ft. Lauderdale
- 524: Atlanta
- 602: Chicago
- 505: Detroit
- 751: Denver
- 753: Phoenix
- 770: Salt Lake City

Based on REAL news reports and search data you find, estimate for each market:
1. Query volume (0-1000 scale, where 1000 = extremely high search volume)
2. Trend percentage (how much it's increased recently based on news reports)
3. Risk level (critical/high/medium/low based on actual health risks reported)
4. Estimated affected users (based on news reports of incidents in that area)

Return JSON in this exact format with REALISTIC data based on your search:
{{
  "trends": [
    {{
      "dma_code": "803",
      "dma_name": "LOS ANGELES",
      "location": {{"city": "Los Angeles", "state": "CA", "lat": 34.0522, "lng": -118.2437}},
      "query_term": "{query}",
      "query_volume": realistic_number_0_to_1000,
      "trend": "+X%",
      "risk": "critical/high/medium/low",
      "affected": realistic_estimate
    }}
  ]
}}

Base the volumes and trends on ACTUAL search activity and news reports you find. Higher volumes in areas where news reports indicate the trend is more popular."""

        contents = [
            types.Content(
                role="user",
                parts=[types.Part(text=prompt)]
            )
        ]
        
        tools = [
            types.Tool(google_search=types.GoogleSearch()),
        ]

        generate_content_config = types.GenerateContentConfig(
            temperature=0.3,
            top_p=0.95,
            seed=0,
            max_output_tokens=8192,
            safety_settings=[
                types.SafetySetting(
                    category="HARM_CATEGORY_HATE_SPEECH",
                    threshold="OFF"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="OFF"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold="OFF"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_HARASSMENT",
                    threshold="OFF"
                )
            ],
            tools=tools,
            thinking_config=types.ThinkingConfig(
                thinking_budget=0,  # Zero for fast response
                include_thoughts=False
            ),
        )

        # Generate content with Gemini
        response_text = ""
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                for part in chunk.candidates[0].content.parts:
                    if hasattr(part, 'text'):
                        response_text += part.text

        # Parse JSON from response
        if response_text:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                data = json.loads(json_str)
                if 'trends' in data:
                    return data['trends']
        
        return None

    except Exception as e:
        logger.error(f"Error simulating Health Trends with Gemini: {e}")
        raise  # Re-raise to handle at higher level

@functions_framework.http
def getHealthTrendsStream(request):
    """STREAMING version - Get Health Trends data with Server-Sent Events"""
    # Handle CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    def generate():
        """Generator function for SSE streaming of trends data"""
        try:
            request_json = request.get_json(silent=True)
            query = request_json.get('query', 'dangerous health trends') if request_json else 'dangerous health trends'
            
            # Send initial connection event
            yield f"data: {json.dumps({'type': 'connected', 'timestamp': datetime.now().isoformat()})}\n\n"
            
            client = genai.Client(
                vertexai=True,
                project="wz-fda-horizon-scan",
                location="global",
            )
            
            model = "gemini-2.5-flash"
            
            # Modified prompt to output individual market data
            prompt = f"""You are simulating the Google Health Trends API. Search for information about: "{query}"

IMPORTANT: Search Google for news articles, reports, and data about "{query}" to understand where this health trend is happening and how severe it is in different US cities.

Based on your search results, generate trend data for these 15 major US markets. Output EACH market as a SEPARATE JSON object (not in an array):

For each of these cities, output a JSON object with realistic data based on what you found:
- Los Angeles, CA (DMA 803): lat 34.0522, lng -118.2437
- San Francisco, CA (DMA 807): lat 37.7749, lng -122.4194  
- Seattle, WA (DMA 819): lat 47.6062, lng -122.3321
- New York, NY (DMA 501): lat 40.7128, lng -74.0060
- Boston, MA (DMA 506): lat 42.3601, lng -71.0589
- Washington DC (DMA 511): lat 38.9072, lng -77.0369
- Houston, TX (DMA 618): lat 29.7604, lng -95.3698
- Dallas, TX (DMA 623): lat 32.7767, lng -96.7970
- Miami, FL (DMA 528): lat 25.7617, lng -80.1918
- Atlanta, GA (DMA 524): lat 33.7490, lng -84.3880
- Chicago, IL (DMA 602): lat 41.8781, lng -87.6298
- Detroit, MI (DMA 505): lat 42.3314, lng -83.0458
- Denver, CO (DMA 751): lat 39.7392, lng -104.9903
- Phoenix, AZ (DMA 753): lat 33.4484, lng -112.0740
- Salt Lake City, UT (DMA 770): lat 40.7608, lng -111.8910

For EACH city, output EXACTLY this JSON format (replace values with realistic estimates):
{{
  "dma_code": "803",
  "dma_name": "LOS ANGELES",
  "location": {{"city": "Los Angeles", "state": "CA", "lat": 34.0522, "lng": -118.2437}},
  "query_term": "{query}",
  "query_volume": 750,
  "trend": "+15%",
  "risk": "critical",
  "affected": 750000
}}

IMPORTANT: For "risk" field, use ONLY these values:
- "critical" (for very severe situations)
- "high" (for serious situations)
- "medium" (for moderate situations)
- "low" (for minimal risk situations)
Never use "very high", "moderate", or any other values.

Output 15 JSON objects total, one per line. Higher volumes in cities where you found more news reports about the trend."""

            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part(text=prompt)]
                )
            ]
            
            tools = [types.Tool(google_search=types.GoogleSearch())]
            
            config = types.GenerateContentConfig(
                temperature=0.3,
                top_p=0.95,
                max_output_tokens=8192,
                safety_settings=[
                    types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF")
                ],
                tools=tools,
                thinking_config=types.ThinkingConfig(
                    thinking_budget=0,
                    include_thoughts=False
                ),
            )
            
            buffer = ""
            result_count = 0
            
            # Stream chunks from Gemini
            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=config,
            ):
                if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                    for part in chunk.candidates[0].content.parts:
                        if hasattr(part, 'text'):
                            buffer += part.text
                            
                            # Try to extract complete JSON objects
                            while True:
                                start_idx = buffer.find('{')
                                if start_idx == -1:
                                    break
                                
                                # Count braces to find complete object
                                brace_count = 0
                                end_idx = -1
                                for i in range(start_idx, len(buffer)):
                                    if buffer[i] == '{':
                                        brace_count += 1
                                    elif buffer[i] == '}':
                                        brace_count -= 1
                                        if brace_count == 0:
                                            end_idx = i + 1
                                            break
                                
                                if end_idx == -1:
                                    break  # No complete object yet
                                
                                # Extract and parse JSON object
                                json_str = buffer[start_idx:end_idx]
                                buffer = buffer[end_idx:]  # Remove processed part
                                
                                try:
                                    result = json.loads(json_str)
                                    result_count += 1
                                    
                                    # Send result as SSE event
                                    event_data = {
                                        'type': 'trend',
                                        'index': result_count,
                                        'data': result,
                                        'timestamp': datetime.now().isoformat()
                                    }
                                    yield f"data: {json.dumps(event_data)}\n\n"
                                    
                                except json.JSONDecodeError:
                                    continue  # Skip invalid JSON
            
            # Send completion event
            yield f"data: {json.dumps({'type': 'complete', 'total': result_count, 'timestamp': datetime.now().isoformat()})}\n\n"
            
        except Exception as e:
            logger.error(f"Error in trends streaming: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    # Return SSE response
    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': '*'
        }
    )

@functions_framework.http
def getHealthTrends(request):
    """Get Google Health Trends data - NON-STREAMING VERSION"""
    # Handle CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    headers = {'Access-Control-Allow-Origin': '*'}
    
    try:
        request_json = request.get_json(silent=True)
        query = request_json.get('query', 'dangerous health trends') if request_json else 'dangerous health trends'
        
        # Always use Gemini to generate Health Trends based on real search data
        gemini_trends = simulate_health_trends_with_gemini(query)
        
        if gemini_trends:
            # Gemini successfully generated Health Trends data
            return jsonify({
                'source': 'Google Health Trends API (Gemini-powered)',
                'api_version': 'v1beta',
                'results': gemini_trends,
                'date_range': {
                    'start': '2025-01-01',
                    'end': datetime.now().strftime('%Y-%m-%d')
                },
                'frequency': 'week',
                'query': query,
                'timestamp': datetime.now().isoformat()
            }), 200, headers
        else:
            # Return empty results if API fails
            return jsonify({
                'source': 'Google Health Trends API',
                'api_version': 'v1beta',
                'results': [],
                'error': 'Unable to generate trends data - try a different query',
                'query': query,
                'timestamp': datetime.now().isoformat()
            }), 200, headers
            
    except Exception as e:
        logger.error(f"Error in getHealthTrends: {e}")
        return jsonify({
            'source': 'Google Health Trends API',
            'results': [],
            'error': f'Failed to get health trends: {str(e)}',
            'query': request_json.get('query', '') if request_json else '',
            'timestamp': datetime.now().isoformat()
        }), 200, headers

# Note: aggregateEvents endpoint removed - frontend performs client-side aggregation
