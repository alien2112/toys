import { Product } from '../types/cart.types'

// Clean, unique products data with proper images
export const products: Product[] = [
  {
    id: 1,
    name: 'سيارة سباق كهربائية',
    price: 299.99,
    image: 'https://picsum.photos/seed/race_car_electric_001/400/400.jpg',
    images: [
      'https://picsum.photos/seed/race_car_electric_001_main/400/400.jpg',
      'https://picsum.photos/seed/race_car_electric_001_side/400/400.jpg',
      'https://picsum.photos/seed/race_car_electric_001_back/400/400.jpg',
      'https://picsum.photos/seed/race_car_electric_001_detail/400/400.jpg'
    ],
    category: 'سيارات'
  },
  {
    id: 2,
    name: 'ديناصور تي ريكس',
    price: 189.99,
    image: 'https://picsum.photos/seed/t_rex_dinosaur_002/400/400.jpg',
    images: [
      'https://picsum.photos/seed/t_rex_dinosaur_002_main/400/400.jpg',
      'https://picsum.photos/seed/t_rex_dinosaur_002_roar/400/400.jpg',
      'https://picsum.photos/seed/t_rex_dinosaur_002_detail/400/400.jpg',
      'https://picsum.photos/seed/t_rex_dinosaur_002_size/400/400.jpg'
    ],
    category: 'ديناصورات'
  },
  {
    id: 3,
    name: 'سفينة فضاء استكشافية',
    price: 349.99,
    image: 'https://picsum.photos/seed/space_ship_explorer_003/400/400.jpg',
    images: [
      'https://picsum.photos/seed/space_ship_explorer_003_main/400/400.jpg',
      'https://picsum.photos/seed/space_ship_explorer_003_cockpit/400/400.jpg',
      'https://picsum.photos/seed/space_ship_explorer_003_engine/400/400.jpg',
      'https://picsum.photos/seed/space_ship_explorer_003_detail/400/400.jpg'
    ],
    category: 'ألعاب فضاء'
  },
  {
    id: 4,
    name: 'مجموعة بناء المدينة',
    price: 279.99,
    image: 'https://picsum.photos/seed/city_building_set_004/400/400.jpg',
    images: [
      'https://picsum.photos/seed/city_building_set_004_full/400/400.jpg',
      'https://picsum.photos/seed/city_building_set_004_detail/400/400.jpg',
      'https://picsum.photos/seed/city_building_set_004_pieces/400/400.jpg',
      'https://picsum.photos/seed/city_building_set_004_box/400/400.jpg'
    ],
    category: 'بناء وتكوين'
  },
  {
    id: 5,
    name: 'روبوت برمجي تفاعلي',
    price: 449.99,
    image: 'https://picsum.photos/seed/programmable_robot_005/400/400.jpg',
    images: [
      'https://picsum.photos/seed/programmable_robot_005_front/400/400.jpg',
      'https://picsum.photos/seed/programmable_robot_005_back/400/400.jpg',
      'https://picsum.photos/seed/programmable_robot_005_control/400/400.jpg',
      'https://picsum.photos/seed/programmable_robot_005_actions/400/400.jpg'
    ],
    category: 'روبوتات وإلكترونيات'
  },
  {
    id: 6,
    name: 'قطار الركاب السريع',
    price: 199.99,
    image: 'https://picsum.photos/seed/high_speed_train_006/400/400.jpg',
    images: [
      'https://picsum.photos/seed/high_speed_train_006_complete/400/400.jpg',
      'https://picsum.photos/seed/high_speed_train_006_locomotive/400/400.jpg',
      'https://picsum.photos/seed/high_speed_train_006_tracks/400/400.jpg',
      'https://picsum.photos/seed/high_speed_train_006_detail/400/400.jpg'
    ],
    category: 'قطارات ومركبات'
  },
  {
    id: 7,
    name: 'حصان البوني الوردي',
    price: 89.99,
    image: 'https://picsum.photos/seed/pink_pony_007/400/400.jpg',
    images: [
      'https://picsum.photos/seed/pink_pony_007_side/400/400.jpg',
      'https://picsum.photos/seed/pink_pony_007_accessories/400/400.jpg',
      'https://picsum.photos/seed/pink_pony_007_detail/400/400.jpg',
      'https://picsum.photos/seed/pink_pony_007_box/400/400.jpg'
    ],
    category: 'حيوانات وحيوانات أليفة'
  },
  {
    id: 8,
    name: 'طاولة الألعاب المتعددة',
    price: 159.99,
    image: 'https://picsum.photos/seed/multi_game_table_008/400/400.jpg',
    images: [
      'https://picsum.photos/seed/multi_game_table_008_top/400/400.jpg',
      'https://picsum.photos/seed/multi_game_table_008_games/400/400.jpg',
      'https://picsum.photos/seed/multi_game_table_008_storage/400/400.jpg',
      'https://picsum.photos/seed/multi_game_table_008_detail/400/400.jpg'
    ],
    category: 'ألعاب طاولة'
  },
  {
    id: 9,
    name: 'طائرة شراعية تحكم عن بعد',
    price: 229.99,
    image: 'https://picsum.photos/seed/rc_glider_plane_009/400/400.jpg',
    images: [
      'https://picsum.photos/seed/rc_glider_plane_009_flying/400/400.jpg',
      'https://picsum.photos/seed/rc_glider_plane_009_controller/400/400.jpg',
      'https://picsum.photos/seed/rc_glider_plane_009_detail/400/400.jpg',
      'https://picsum.photos/seed/rc_glider_plane_009_packaging/400/400.jpg'
    ],
    category: 'طائرات ومروحيات'
  },
  {
    id: 10,
    name: 'مجموعة الألغاز العلمية',
    price: 119.99,
    image: 'https://picsum.photos/seed/science_puzzle_set_010/400/400.jpg',
    images: [
      'https://picsum.photos/seed/science_puzzle_set_010_complete/400/400.jpg',
      'https://picsum.photos/seed/science_puzzle_set_010_pieces/400/400.jpg',
      'https://picsum.photos/seed/science_puzzle_set_010_manual/400/400.jpg',
      'https://picsum.photos/seed/science_puzzle_set_010_experiments/400/400.jpg'
    ],
    category: 'ألعاب تعليمية'
  },
  {
    id: 11,
    name: 'دراجة هوائية للأطفال',
    price: 139.99,
    image: 'https://picsum.photos/seed/kids_bicycle_011/400/400.jpg',
    images: [
      'https://picsum.photos/seed/kids_bicycle_011_side/400/400.jpg',
      'https://picsum.photos/seed/kids_bicycle_011_details/400/400.jpg',
      'https://picsum.photos/seed/kids_bicycle_011_seat/400/400.jpg',
      'https://picsum.photos/seed/kids_bicycle_011_wheels/400/400.jpg'
    ],
    category: 'دراجات ودراجات هوائية'
  },
  {
    id: 12,
    name: 'قلعة الفرسان المضيئة',
    price: 389.99,
    image: 'https://picsum.photos/seed/illuminated_knight_castle_012/400/400.jpg',
    images: [
      'https://picsum.photos/seed/illuminated_knight_castle_012_front/400/400.jpg',
      'https://picsum.photos/seed/illuminated_knight_castle_012_inside/400/400.jpg',
      'https://picsum.photos/seed/illuminated_knight_castle_012_night/400/400.jpg',
      'https://picsum.photos/seed/illuminated_knight_castle_012_detail/400/400.jpg'
    ],
    category: 'قلعة وحصون'
  }
]

// Helper function to get unique categories
export const getUniqueCategories = (): string[] => {
  return [...new Set(products.map(product => product.category))]
}

// Helper function to get products by category
export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category)
}

// Helper function to get featured products (based on price for demo)
export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.price >= 200).slice(0, 6)
}

// Helper function to search products
export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  )
}
