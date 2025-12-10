import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { booksAPI } from '@/lib/api'
import { BookOpen, Save, X, Upload, Loader2, Image, Trash2, MapPin, Tag } from 'lucide-react'

const BookForm = ({ book = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publishedYear: new Date().getFullYear(),
    publisher: '',
    description: '',
    totalCopies: 1,
    location: {
      shelf: '',
      row: '',
      position: '',
      section: ''
    },
    language: 'English',
    edition: '',
    pages: '',
    tags: ''
  })
  const [coverImage, setCoverImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const genres = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
    'Thriller', 'Romance', 'Biography', 'History', 'Science',
    'Technology', 'Art', 'Travel', 'Cooking', 'Health',
    'Children', 'Young Adult', 'Poetry', 'Drama', 'Comedy'
  ]

  const cleanLocationData = (location) => {
    if (!location) return null
    const cleanLocation = { ...location }
    delete cleanLocation.qrCode
    Object.keys(cleanLocation).forEach(key => {
      if (cleanLocation[key] === '' || cleanLocation[key] == null) {
        delete cleanLocation[key]
      }
    })
    return Object.keys(cleanLocation).length > 0 ? cleanLocation : null
  }

  useEffect(() => {
    if (book) {
      const cleanLocation = cleanLocationData(book.location) || {
        shelf: '',
        row: '',
        position: '',
        section: ''
      }

      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        genre: book.genre || '',
        publishedYear: book.publishedYear || new Date().getFullYear(),
        publisher: book.publisher || '',
        description: book.description || '',
        totalCopies: book.totalCopies || 1,
        location: cleanLocation,
        language: book.language || 'English',
        edition: book.edition || '',
        pages: book.pages || '',
        tags: book.tags?.join(', ') || ''
      })
      
      if (book.coverImage?.url) {
        setImagePreview(book.coverImage.url)
      }
    }
  }, [book])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, WebP)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setCoverImage(file)
      setError('')
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setCoverImage(null)
    setImagePreview('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.title || !formData.author || !formData.isbn || !formData.genre || !formData.totalCopies) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      const cleanLocation = cleanLocationData(formData.location)
      let response

      if (book) {
         const bookData = {
            ...formData,
            publishedYear: parseInt(formData.publishedYear),
            totalCopies: parseInt(formData.totalCopies),
            pages: formData.pages ? parseInt(formData.pages) : undefined,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            location: cleanLocation
         }
         response = await booksAPI.update(book._id, bookData)
         if (coverImage) {
            const imageFormData = new FormData()
            imageFormData.append('coverImage', coverImage)
            await booksAPI.updateCover(book._id, imageFormData)
         }
      } else {
         const formDataToSend = new FormData()
         Object.keys(formData).forEach(key => {
            if (key === 'location') {
               if(cleanLocation) formDataToSend.append('location', JSON.stringify(cleanLocation))
            } else if (key === 'tags') {
               const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
               if(tagsArray.length) formDataToSend.append('tags', JSON.stringify(tagsArray))
            } else {
               formDataToSend.append(key, formData[key])
            }
         })
         if (coverImage) formDataToSend.append('coverImage', coverImage)
         response = await booksAPI.create(formDataToSend)
      }
      onSave(response.data.book)
    } catch (error) {
      console.error(error)
      setError(error.message || 'Failed to save book')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('location.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: value } }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleNumberChange = (e) => {
      const { name, value } = e.target
      handleChange({ target: { name, value: parseInt(value) || '' } })
  }

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
  const modalVariants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 } }

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onCancel}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl bg-card border border-border"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">{book ? 'Edit Book' : 'Add New Book'}</h2>
                <p className="text-xs text-muted-foreground">{book ? 'Update book details' : 'Add to library catalog'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-background">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Cover Image</h3>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="shrink-0 group relative w-32 h-48 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="icon" variant="destructive" onClick={removeImage} className="rounded-full h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <span className="text-[10px] text-muted-foreground">No Cover</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                       <label className="block text-sm font-medium mb-2">Upload New Cover</label>
                       <div className="flex items-center gap-3">
                          <label className="cursor-pointer">
                             <span className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                                <Upload className="h-4 w-4 mr-2" /> Choose File
                             </span>
                             <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                          </label>
                          <span className="text-xs text-muted-foreground">
                             {coverImage ? coverImage.name : 'No file chosen'}
                          </span>
                       </div>
                       <p className="text-xs text-muted-foreground mt-2">
                          Max size 5MB. Formats: JPG, PNG, WebP. Recommended ratio 2:3.
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
                    <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. The Great Gatsby" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Author <span className="text-destructive">*</span></label>
                    <Input name="author" value={formData.author} onChange={handleChange} placeholder="e.g. F. Scott Fitzgerald" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">ISBN <span className="text-destructive">*</span></label>
                    <Input name="isbn" value={formData.isbn} onChange={handleChange} placeholder="ISBN-13" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Genre <span className="text-destructive">*</span></label>
                    <select name="genre" value={formData.genre} onChange={handleChange} required className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-ring">
                      <option value="">Select Genre</option>
                      {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-medium">Description</label>
                   <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      rows={3} 
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring"
                      placeholder="Book summary..." 
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-sm font-medium">Publisher</label>
                          <Input name="publisher" value={formData.publisher} onChange={handleChange} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-sm font-medium">Year</label>
                          <Input name="publishedYear" type="number" value={formData.publishedYear} onChange={handleNumberChange} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-sm font-medium">Language</label>
                          <Input name="language" value={formData.language} onChange={handleChange} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-sm font-medium">Total Copies <span className="text-destructive">*</span></label>
                          <Input name="totalCopies" type="number" min="1" value={formData.totalCopies} onChange={handleNumberChange} required />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
                       <MapPin className="h-4 w-4" /> Location
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-sm font-medium">Shelf</label>
                          <Input name="location.shelf" value={formData.location.shelf} onChange={handleChange} placeholder="A1" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-sm font-medium">Section</label>
                          <Input name="location.section" value={formData.location.section} onChange={handleChange} placeholder="Fiction" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-sm font-medium">Row</label>
                          <Input name="location.row" type="number" value={formData.location.row} onChange={handleNumberChange} placeholder="1" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-sm font-medium">Position</label>
                          <Input name="location.position" type="number" value={formData.location.position} onChange={handleNumberChange} placeholder="1" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Tags
                 </h3>
                 <Input name="tags" value={formData.tags} onChange={handleChange} placeholder="classic, adventure, best-seller..." />
                 <p className="text-xs text-muted-foreground">Comma separated values</p>
              </div>

            </form>
          </div>

          <div className="border-t border-border p-4 sm:p-6 bg-background/50 backdrop-blur-md sticky bottom-0 z-10 flex justify-end gap-3">
             <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
             <Button onClick={handleSubmit} disabled={loading} className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {loading ? 'Saving...' : 'Save Book'}
             </Button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BookForm