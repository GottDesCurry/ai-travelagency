import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

interface Flight {
  id: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
  departure: {
    iataCode: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  airline: string;
}

// Exakter Typ für Amadeus-Antwort (nur das was du nutzt)
interface AmadeusFlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: {
    duration: string;
    segments: {
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
    }[];
  }[];
}

interface AmadeusApiResponse {
  data: AmadeusFlightOffer[];
}

function reduceFlightData(data: AmadeusApiResponse): Flight[] {
  return (
    data?.data?.slice(0, 15).map((flight) => {
      const itinerary = flight.itineraries[0];
      const segments = itinerary.segments;
      return {
        id: flight.id,
        price: parseFloat(flight.price.total || '0'),
        currency: flight.price.currency || 'CHF',
        duration: itinerary.duration || '',
        stops: segments.length - 1,
        departure: segments[0].departure,
        arrival: segments[segments.length - 1].arrival,
        airline: segments[0].carrierCode || 'Unbekannt',
      };
    }) || []
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const flightData = req.body as AmadeusApiResponse;
  const reducedFlights = reduceFlightData(flightData);

  const prompt = `Wähle aus diesen Flugangeboten die 3 besten aus. Kriterien: Günstigster Preis, gute Flugzeiten, möglichst wenig Stopps. Antworte im JSON-Array mit den besten 3 Flügen:\n\n${JSON.stringify(reducedFlights)}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Du bist ein intelligenter Reiseberater.' },
        { role: 'user', content: prompt },
      ],
    });

    const output = response.choices[0].message?.content || '[]';

    try {
      const parsed = JSON.parse(output);
      res.status(200).json(parsed);
    } catch {
      console.warn('❗️Antwort von OpenAI war kein gültiges JSON:', output);
      res.status(200).json([]);
    }
  } catch (e) {
    console.error('Fehler bei der Verarbeitung in /api/ai:', e);
    res.status(500).json([]);
  }
}
