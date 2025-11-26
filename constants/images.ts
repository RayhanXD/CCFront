// Stock photos for placeholder images
export const STOCK_PHOTOS = [
  require('@/assets/images/Stock-Photos/library-bks.jpg'),
  require('@/assets/images/Stock-Photos/library.jpg'),
  require('@/assets/images/Stock-Photos/man-computer.jpg'),
  require('@/assets/images/Stock-Photos/open-book.jpg'),
];

// Calendar image for event creation
export const CALENDAR_IMAGE = require('@/assets/images/calendar.png');

// Get a random stock photo
export const getRandomStockPhoto = () => {
  const randomIndex = Math.floor(Math.random() * STOCK_PHOTOS.length);
  return STOCK_PHOTOS[randomIndex];
};

// Get stock photo by index (for consistent images per item)
export const getStockPhotoByIndex = (index: number) => {
  return STOCK_PHOTOS[index % STOCK_PHOTOS.length];
};
