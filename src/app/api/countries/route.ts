import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch from the detailed countries API
    const response = await fetch('https://mongoliansgo.hustler.mn/api/roamwifi/get-sku-list-continent', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    
    // Return a fallback response with mock data in the expected format
    const fallbackData = {
      continent: ["Asia", "Europe", "Africa"],
      data: {
        Asia: [
          { continentCode: 1, countryCode: 156, display: "China", imageUrl: "", note: null, search: "China", skuid: 155 },
          { continentCode: 1, countryCode: 392, display: "Japan", imageUrl: "", note: null, search: "Japan", skuid: 26 },
          { continentCode: 1, countryCode: 410, display: "South Korea", imageUrl: "", note: null, search: "Korea", skuid: 16 },
          { continentCode: 1, countryCode: 764, display: "Thailand", imageUrl: "", note: null, search: "Thailand", skuid: 15 },
          { continentCode: 1, countryCode: 704, display: "Vietnam", imageUrl: "", note: null, search: "Vietnam", skuid: 39 },
          { continentCode: 1, countryCode: 702, display: "Singapore", imageUrl: "", note: null, search: "Singapore", skuid: 10 },
          { continentCode: 1, countryCode: 458, display: "Malaysia", imageUrl: "", note: null, search: "Malaysia", skuid: 13 },
          { continentCode: 1, countryCode: 360, display: "Indonesia", imageUrl: "", note: null, search: "Indonesia", skuid: 14 },
        ]
      }
    };

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch from external API, returning fallback data',
        ...fallbackData,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
