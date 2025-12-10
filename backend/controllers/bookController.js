import Book from '../models/Book.js';
import { bookSchema } from '../schemas/bookSchema.js';
import cloudinary from '../utils/cloudinary.js';
import QRCode from 'qrcode';

export const createBook = async (req, res) => {
  try {
    const { error } = bookSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details[0].message 
      });
    }

    const bookData = {
      ...req.body,
      availableCopies: req.body.availableCopies || req.body.totalCopies
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'library/books',
        transformation: [
          { width: 400, height: 600, crop: 'fill' },
          { quality: 'auto' }
        ]
      });

      bookData.coverImage = {
        url: result.secure_url,
        thumbnailUrl: cloudinary.url(result.public_id, {
          width: 200,
          height: 300,
          crop: 'fill',
          quality: 'auto'
        }),
        publicId: result.public_id
      };
    }

    if (bookData.location) {
      const qrData = JSON.stringify({
        bookId: bookData.isbn,
        title: bookData.title,
        location: bookData.location,
        author: bookData.author,
        genre: bookData.genre,
        publishedYear: bookData.publishedYear,
        publisher: bookData.publisher,
        description: bookData.description,
        totalCopies: bookData.totalCopies,
        availableCopies: bookData.availableCopies,
        language: bookData.language,
        edition: bookData.edition,
        pages: bookData.pages,
        tags: bookData.tags,
        coverImage: bookData.coverImage
      });
      
      bookData.location.qrCode = await QRCode.toDataURL(qrData);
    }

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({ 
      message: 'Book created successfully', 
      book 
    });
  } catch (error) {
    console.error('Book creation error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'ISBN already exists',
        details: 'A book with this ISBN already exists in the system'
      });
    }
    
    res.status(500).json({ 
      error: 'Error creating book',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', genre = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      query.genre = genre;
    }

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching books' });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching book' });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { error } = bookSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    res.status(500).json({ error: 'Error updating book' });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book.coverImage && book.coverImage.publicId) {
      await cloudinary.uploader.destroy(book.coverImage.publicId);
    }

    await Book.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Book deletion error:', error);
    res.status(500).json({ error: 'Error deleting book' });
  }
};

export const updateBookCover = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (book.coverImage && book.coverImage.publicId) {
      await cloudinary.uploader.destroy(book.coverImage.publicId);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'library/books',
      transformation: [
        { width: 400, height: 600, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    book.coverImage = {
      url: result.secure_url,
      thumbnailUrl: cloudinary.url(result.public_id, {
        width: 200,
        height: 300,
        crop: 'fill',
        quality: 'auto'
      }),
      publicId: result.public_id
    };

    await book.save();

    res.json({ 
      message: 'Book cover updated successfully', 
      coverImage: book.coverImage 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating book cover' });
  }
};

export const getBookLocationQR = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const qrCode = await QRCode.toBuffer(book.generateQRData());
    
    res.set('Content-Type', 'image/png');
    res.send(qrCode);
  } catch (error) {
    res.status(500).json({ error: 'Error generating QR code' });
  }
};

export const getBookAnalytics = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ status: 'available' });
    const lowStockBooks = await Book.aggregate([
      {
        $addFields: {
          stockRatio: { $divide: ['$availableCopies', '$totalCopies'] }
        }
      },
      {
        $match: {
          stockRatio: { $lte: 0.2 }
        }
      },
      {
        $count: 'count'
      }
    ]);

    const genreDistribution = await Book.aggregate([
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const yearlyStats = await Book.aggregate([
      {
        $group: {
          _id: '$publishedYear',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      totalBooks,
      availableBooks,
      lowStockBooks: lowStockBooks[0]?.count || 0,
      genreDistribution,
      yearlyStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
};

export const advancedSearch = async (req, res) => {
  try {
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
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
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

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const books = await Book.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      filters: {
        search,
        genre,
        author,
        yearFrom,
        yearTo,
        status,
        language,
        tags
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error performing advanced search' });
  }
};