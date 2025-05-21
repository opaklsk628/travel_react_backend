// 先載入.env檔確保 API_KEY / SECRET 可用
import 'dotenv/config';
import Amadeus from 'amadeus';

// 初始化 Amadeus SDK
const amadeus = new Amadeus({
  clientId:     process.env.AMADEUS_KEY,
  clientSecret: process.env.AMADEUS_SECRET,
});

// 酒店清單
export async function fetchHotels(cityCode = 'PAR') {
  const res = await amadeus.referenceData.locations.hotels.byCity.get({
    cityCode,
  });
  return res.data;   // [{ hotelId, name, latitude, longitude }]
}

// 酒店照片, 星級
export async function fetchHotelDetails(hotelIds: string[]) {
  const photoMap: Record<string, string> = {};
  const ratingMap: Record<string, string> = {};

  hotelIds.forEach(id => (ratingMap[id] = '—')); // Sandbox 無星級

  const photosEP = amadeus.referenceData?.locations?.hotels?.photos;

  if (photosEP && typeof photosEP.get === 'function') {
    try {
      const res = await photosEP.get({
        hotelIds: hotelIds.slice(0, 20).join(','), // API 限 20
      });
      res.data.forEach((p: any) => {
        const url = p.photos?.[0]?.url;
        if (url) photoMap[p.hotelId] = url;
      });
    } catch {
      console.warn('Photos endpoint failed, 繼續無圖');
    }
  } else {
    console.warn('Photos API not available on this Amadeus plan');
  }

  return { photoMap, ratingMap };
}

// 城市搜尋 (Autocomplete) 

export async function searchCities(keyword: string) {
  const res = await amadeus.referenceData.locations.get({
    keyword,
    subType: 'CITY',
  });
  return res.data;
}


// 測試Amadeus API獲取酒店詳情
// https://developers.amadeus.com/self-service/category/hotel/api-doc/hotel-search/api-reference

export async function testHotelDetailsApi(hotelId: string) {
  try {
    // 嘗試獲取更多詳情 (Hotel Search API v3)
    // 首先使用hotel offers搜索API，需要hotelId
    const offersResponse = await amadeus.shopping.hotelOffers.get({
      hotelIds: hotelId
    });
    
    return {
      success: true,
      apiResponse: offersResponse.data
    };
  } catch (error: any) {
    // 返回錯誤信息
    return {
      success: false,
      message: error.message || 'Failed to get hotel details',
      errorData: error.response?.result || error
    };
  }
}


// 使用現有資源獲取酒店詳情

export async function getSingleHotelDetail(hotelId: string) {
  // 使用現有函數獲取照片和評級
  const { photoMap, ratingMap } = await fetchHotelDetails([hotelId]);
  
  // 基本詳情
  return {
    id: hotelId,
    name: '酒店 ' + hotelId, // 由於API限制，用ID作為名稱
    image: photoMap[hotelId] || null,
    stars: ratingMap[hotelId] || '—',
    cityCode: 'PAR', // 預設巴黎
    description: '這家酒店提供舒適的住宿環境和優質的服務。',
    features: ['WiFi', '空調', '停車場']
  };
}
