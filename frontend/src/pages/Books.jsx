import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, Filter, Grid3X3, List, Plus, 
  BookOpen, Calendar, MapPin, Eye, Edit, 
  Trash2, Bookmark, MoreVertical, Loader2, 
  X, QrCode, Download, ChevronDown
} from 'lucide-react'
import { booksAPI, borrowAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import BookForm from '@/components/Book/BookForm'
import BookDetails from '@/components/Book/BookDetails'

const Books = () => {
  const { user, hasPermission } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [showBookForm, setShowBookForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [showBookDetails, setShowBookDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrLoading, setQrLoading] = useState(false)

  const { id: routeBookId } = useParams()

  const genres = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
    'Thriller', 'Romance', 'Biography', 'History', 'Science',
    'Technology', 'Art', 'Travel', 'Cooking', 'Health',
    'Children', 'Young Adult', 'Poetry', 'Drama', 'Comedy'
  ]

  useEffect(() => {
    fetchBooks()
  }, [searchTerm, selectedGenre])

  useEffect(() => {
    if (!routeBookId || !books.length) return
    const matchedBook = books.find(b => b._id === routeBookId)
    if (matchedBook) {
      setSelectedBook(matchedBook)
      setShowBookDetails(true)
    }
  }, [routeBookId, books])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 50,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedGenre && { genre: selectedGenre })
      }
      const response = await booksAPI.getAll(params)
      setBooks(response.data.books)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"?`)) return
    try {
      setActionLoading(bookId)
      await booksAPI.delete(bookId)
      setBooks(books.filter(book => book._id !== bookId))
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Error deleting book')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBorrowBook = async (bookId, bookTitle) => {
    if (!user) {
      alert('Please login to borrow books')
      return
    }
    try {
      setActionLoading(bookId)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14) 

      await borrowAPI.borrow({
        userId: user._id,
        bookId: bookId,
        dueDate: dueDate.toISOString()
      })

      alert(`"${bookTitle}" borrowed successfully!`)
      fetchBooks()
    } catch (error) {
      console.error('Error borrowing book:', error)
      alert(error.response?.data?.error || 'Failed to borrow book')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveBook = (savedBook) => {
    if (editingBook) {
      setBooks(books.map(book => book._id === savedBook._id ? savedBook : book))
    } else {
      setBooks([savedBook, ...books])
    }
    setShowBookForm(false)
    setEditingBook(null)
  }

  const handleGenerateQR = async (book) => {
    try {
      setQrLoading(true)
      const response = await booksAPI.getQRCode(book._id)
      const url = URL.createObjectURL(response.data)
      setQrCodeUrl(url)
      setSelectedBook(book)
      setShowQRModal(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    } finally {
      setQrLoading(false)
    }
  }

  const BookCard = ({ book }) => {
    const [showActions, setShowActions] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
      if (!showActions) return
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setShowActions(false)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }, [showActions])

    return (
      <Card className="group relative border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg overflow-visible">
        <div className="absolute top-3 right-3 z-10">
          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm ${
            book.status === 'available' 
              ? 'bg-white/90 text-green-700 border border-green-200'
              : 'bg-white/90 text-red-700 border border-red-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${book.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {book.status}
          </span>
        </div>

        <CardContent className="p-0">
          <div className="relative aspect-[3/4] bg-muted overflow-hidden border-b border-border group-hover:opacity-90 transition-opacity">
            {book.coverImage?.url ? (
              <img 
                src={book.coverImage.url} 
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center">
                <BookOpen className="h-12 w-12 mb-2 opacity-20" />
                <span className="text-xs font-medium opacity-50">No Cover Image</span>
              </div>
            )}
          
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full w-10 h-10 shadow-lg hover:scale-110 transition-transform"
                onClick={() => { setSelectedBook(book); setShowBookDetails(true); }}
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {user && book.status === 'available' && hasPermission('member') && (
                <Button 
                  size="icon" 
                  className="rounded-full w-10 h-10 shadow-lg bg-primary text-primary-foreground hover:scale-110 transition-transform"
                  onClick={() => handleBorrowBook(book._id, book.title)}
                  disabled={actionLoading === book._id}
                  title="Borrow Book"
                >
                  {actionLoading === book._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-base text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors" title={book.title}>
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{book.author}</p>
            
            <div className="space-y-2 text-xs text-muted-foreground/80">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3 w-3" />
                <span className="truncate">{book.genre}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{book.location?.shelf || 'Shelf A1'}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span>{book.publishedYear}</span>
                <span className={book.availableCopies > 0 ? 'text-green-600 font-medium' : 'text-red-500'}>
                  {book.availableCopies} left
                </span>
              </div>
            </div>
          </div>
          <div className="sm:hidden absolute bottom-4 right-4" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-muted"
              onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 bottom-full mb-2 w-48 bg-card border border-border shadow-xl rounded-lg z-20 overflow-hidden"
                >
                  <div className="py-1">
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => { setShowActions(false); setSelectedBook(book); setShowBookDetails(true); }}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </button>
                    {hasPermission('librarian') && (
                      <>
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted"
                          onClick={() => { setShowActions(false); setEditingBook(book); setShowBookForm(true); }}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </button>
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => { setShowActions(false); handleDeleteBook(book._id, book.title); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Library Catalog</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Explore {books.length > 0 ? books.length : 'our'} books available for borrowing.
            </p>
          </div>
          
          {hasPermission('librarian') && (
            <Button onClick={() => setShowBookForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Book
            </Button>
          )}
        </div>

        <Card className="border-border bg-card mb-8 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by title, author, or ISBN..." 
                  className="pl-9 bg-background border-border"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <div className="relative min-w-[140px]">
                  <select 
                    className="w-full h-10 pl-3 pr-8 rounded-md border border-border bg-background text-sm appearance-none focus:ring-1 focus:ring-primary cursor-pointer"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                  >
                    <option value="">All Genres</option>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                <div className="flex border border-border rounded-md overflow-hidden bg-background">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <div className="w-px bg-border"></div>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {(searchTerm || selectedGenre) && (
                  <Button 
                    variant="ghost" 
                    onClick={() => { setSearchTerm(''); setSelectedGenre(''); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {books.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-xl border-dashed">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No books found</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">We couldn't find any books matching your criteria.</p>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedGenre(''); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <motion.div 
                layout
                className={viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
                  : "space-y-4"
                }
              >
                <AnimatePresence>
                  {books.map((book, index) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}

        {!loading && books.length > 0 && books.length >= 50 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="border-border hover:bg-muted">
              Load More
            </Button>
          </div>
        )}

        <AnimatePresence>
          {showBookForm && (
            <BookForm
              book={editingBook}
              onSave={handleSaveBook}
              onCancel={() => { setShowBookForm(false); setEditingBook(null); }}
            />
          )}
          {showBookDetails && selectedBook && (
            <BookDetails
              book={selectedBook}
              onClose={() => { setShowBookDetails(false); setSelectedBook(null); }}
              onBorrow={handleBorrowBook}
            />
          )}
          {showQRModal && selectedBook && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowQRModal(false)}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card border border-border p-6 rounded-xl shadow-2xl max-w-sm w-full text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">QR Code</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowQRModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto mb-6 border border-border rounded-lg p-2" />}
                <p className="font-medium mb-4">{selectedBook.title}</p>
                <Button className="w-full" onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrCodeUrl;
                  link.download = `qr-${selectedBook.title}.png`;
                  link.click();
                }}>
                  <Download className="h-4 w-4 mr-2" /> Download Image
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default Books