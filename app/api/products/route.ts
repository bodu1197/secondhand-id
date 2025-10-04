import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("--- [GET /api/products] Received request ---");
    const { searchParams } = new URL(request.url);
    console.log(`Request URL: ${request.url}`);

    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const location = searchParams.get('location');
    const regency = searchParams.get('regency');
    const userLat = searchParams.get('latitude');
    const userLon = searchParams.get('longitude');
    const radiusKm = searchParams.get('radius');

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    let productsQuery = supabase.from('listings').select(`
      id,
      title,
      description,
      price,
      condition,
      category,
      location,
      images,
      created_at,
      latitude,
      longitude
    `);

    if (query && query.trim() !== '') {
      productsQuery = productsQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (category) {
      productsQuery = productsQuery.eq('category', category);
    }
    if (location) {
      productsQuery = productsQuery.eq('location', location);
    }
    if (regency) {
      productsQuery = productsQuery.eq('location_regency', regency); // Assuming a column named 'location_regency' for regency
    }
    if (subcategory) {
      productsQuery = productsQuery.eq('subcategory', subcategory); // Assuming a column named 'subcategory'
    }

    if (userLat && userLon && radiusKm) {
      const lat = parseFloat(userLat);
      const lon = parseFloat(userLon);
      const radius = parseFloat(radiusKm) * 1000; // Convert km to meters for st_distance_sphere

      productsQuery = productsQuery.filter(
        'st_distance_sphere(st_makepoint(longitude, latitude), st_makepoint(?, ?))',
        'lte',
        radius,
        lon, // Pass lon first for st_makepoint(lon, lat)
        lat
      );
    }

    console.log("--- [GET /api/products] Executing Supabase query ---");
    const { data, error } = await productsQuery;

    if (error) {
      console.error("--- [GET /api/products] Supabase fetch error ---", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("--- [GET /api/products] Query successful, returning data. ---");
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("--- [GET /api/products] An unexpected error occurred ---", error);
    return NextResponse.json({ error: "An internal server error occurred.", message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, description, price, condition, category_main, category_sub, location_province, location_regency, contact_info, images } = await request.json();
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase.from('listings').insert({
      user_id: user.id,
      title,
      description,
      price,
      condition,
      category,
      location,
      images,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Product registered successfully", data }, { status: 201 });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
