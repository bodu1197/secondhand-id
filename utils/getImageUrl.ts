export function getImageUrl(imageUrl: string): string {
  // 이미 전체 URL이면 그대로 반환
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // 경로만 있으면 전체 URL 생성
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Ensure supabaseUrl is defined
  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
    return imageUrl; // Fallback to original if URL is not configured
  }
  return `${supabaseUrl}/storage/v1/object/public/listings-images/${imageUrl}`;
}