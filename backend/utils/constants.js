export const USER_ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian',
  MEMBER: 'member'
};

export const BOOK_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable'
};

export const BORROW_STATUS = {
  BORROWED: 'borrowed',
  RETURNED: 'returned',
  OVERDUE: 'overdue'
};

export const FINE_RATE = 5; 

export const MAX_BORROW_DAYS = 14; 

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

export const VALID_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Biography',
  'History',
  'Science',
  'Technology',
  'Art',
  'Travel',
  'Cooking',
  'Health',
  'Children',
  'Young Adult',
  'Poetry',
  'Drama',
  'Comedy',
  'Adventure',
  'Crime',
  'Philosophy',
  'Religion',
  'Business',
  'Economics',
  'Education',
  'Sports'
];

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  DUPLICATE_ENTRY: 'Duplicate entry found',
  SERVER_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_EXISTS: 'User already exists',
  BOOK_EXISTS: 'Book with this ISBN already exists',
  NO_COPIES_AVAILABLE: 'No copies available for borrowing',
  ALREADY_BORROWED: 'Book already borrowed by user',
  ACTIVE_BORROWS: 'User has active borrowed books'
};

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_DEACTIVATED: 'User deactivated successfully',
  USER_ACTIVATED: 'User activated successfully',
  BOOK_CREATED: 'Book created successfully',
  BOOK_UPDATED: 'Book updated successfully',
  BOOK_DELETED: 'Book deleted successfully',
  BOOK_BORROWED: 'Book borrowed successfully',
  BOOK_RETURNED: 'Book returned successfully',
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful'
};