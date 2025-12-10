import BorrowRecord from '../models/BorrowRecord.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { borrowSchema } from '../schemas/borrowSchema.js';

export const borrowBook = async (req, res) => {
  try {
    const { error } = borrowSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, bookId, dueDate } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({ error: 'No copies available' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingBorrow = await BorrowRecord.findOne({
      user: userId,
      book: bookId,
      status: 'borrowed'
    });

    if (existingBorrow) {
      return res.status(400).json({ error: 'Book already borrowed by this user' });
    }

    const borrowRecord = new BorrowRecord({
      user: userId,
      book: bookId,
      dueDate
    });

    book.availableCopies -= 1;
    if (book.availableCopies === 0) {
      book.status = 'unavailable';
    }

    await Promise.all([borrowRecord.save(), book.save()]);

    await borrowRecord.populate('user', 'name email membershipId');
    await borrowRecord.populate('book', 'title author isbn');

    res.status(201).json({
      message: 'Book borrowed successfully',
      borrowRecord
    });
  } catch (error) {
    res.status(500).json({ error: 'Error borrowing book' });
  }
};

export const returnBook = async (req, res) => {
  try {
    const borrowId = req.params.borrowId;

    const borrowRecord = await BorrowRecord.findById(borrowId);
    if (!borrowRecord) {
      return res.status(404).json({ error: 'Borrow record not found' });
    }

    if (borrowRecord.status === 'returned') {
      return res.status(400).json({ error: 'Book already returned' });
    }

    const book = await Book.findById(borrowRecord.book);
    book.availableCopies += 1;
    book.status = 'available';

    borrowRecord.returnDate = new Date();
    borrowRecord.status = 'returned';

    const dueDate = new Date(borrowRecord.dueDate);
    const returnDate = new Date();
    
    if (returnDate > dueDate) {
      const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      borrowRecord.fineAmount = daysLate * 5; // $5 per day late
    }

    await Promise.all([borrowRecord.save(), book.save()]);

    await borrowRecord.populate('user', 'name email membershipId');
    await borrowRecord.populate('book', 'title author isbn');

    res.json({
      message: 'Book returned successfully',
      borrowRecord
    });
  } catch (error) {
    res.status(500).json({ error: 'Error returning book' });
  }
};

export const getBorrowRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', userId = '' } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (userId) {
      query.user = userId;
    }

    const borrowRecords = await BorrowRecord.find(query)
      .populate(
        'user',
        'name email membershipId avatar isActive role phone address'
      )
      .populate(
        'book',
        'title author isbn genre publishedYear publisher language edition pages status location coverImage'
      )
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ borrowDate: -1 });

    const total = await BorrowRecord.countDocuments(query);

    res.json({
      borrowRecords,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching borrow records' });
  }
};