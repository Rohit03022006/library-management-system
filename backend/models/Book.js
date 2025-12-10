import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  genre: {
    type: String,
    required: true,
    index: true
  },
  publishedYear: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear()
  },
  publisher: String,
  description: String,
  coverImage: {
    url: String,
    thumbnailUrl: String,
    publicId: String 
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    shelf: String,
    row: Number,
    position: Number,
    section: String,
    qrCode: String 
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'maintenance'],
    default: 'available'
  },
  tags: [String],
  language: {
    type: String,
    default: 'English'
  },
  edition: String,
  pages: Number,
  digitalCopy: {
    available: Boolean,
    format: String,
    fileSize: String
  },
  aiSummary: String, 
  popularityScore: {
    type: Number,
    default: 0
  },
  lastBorrowed: Date
}, {
  timestamps: true
});

bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ 'location.shelf': 1, 'location.row': 1, 'location.position': 1 });

bookSchema.virtual('isLowStock').get(function() {
  return this.availableCopies <= Math.ceil(this.totalCopies * 0.2);
});

bookSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('totalCopies')) {
    this.availableCopies = this.totalCopies;
  }
  
  if (this.availableCopies === 0) {
    this.status = 'unavailable';
  } else if (this.availableCopies > 0 && this.status === 'unavailable') {
    this.status = 'available';
  }
  
  next();
});

bookSchema.methods.generateQRData = function() {
  return JSON.stringify({
    bookId: this._id,
    title: this.title,
    location: this.location,
    author: this.author,
    genre: this.genre,
    publishedYear: this.publishedYear,
    publisher: this.publisher,
    description: this.description,
    totalCopies: this.totalCopies,
    availableCopies: this.availableCopies,
    language: this.language,
    edition: this.edition,
    pages: this.pages,
    tags: this.tags,
    coverImage: this.coverImage
  });
};

bookSchema.statics.advancedSearch = function(filters = {}) {
  const {
    search,
    genre,
    author,
    yearFrom,
    yearTo,
    status,
    language,
    tags,
    page = 1,
    limit = 10,
    sortBy = 'title',
    sortOrder = 'asc'
  } = filters;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  if (genre) query.genre = genre;
  if (author) query.author = new RegExp(author, 'i');
  if (status) query.status = status;
  if (language) query.language = language;
  
  if (yearFrom || yearTo) {
    query.publishedYear = {};
    if (yearFrom) query.publishedYear.$gte = parseInt(yearFrom);
    if (yearTo) query.publishedYear.$lte = parseInt(yearTo);
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

export default mongoose.model('Book', bookSchema);