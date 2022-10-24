import Book from './book'
import Contents from './contents'
import CFI from './epubcfi'
import ContinuousViewManager from './managers/continuous'
import DefaultViewManager from './managers/default'
import IframeView from './managers/views/iframe'
import Rendition from './rendition'
import { EPUBJS_VERSION } from './utils/constants'
import * as utils from './utils/core'

/**
 * Creates a new Book
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */
function ePub(url, options) {
  return new Book(url, options)
}

ePub.VERSION = EPUBJS_VERSION

if (typeof global !== 'undefined') {
  global.EPUBJS_VERSION = EPUBJS_VERSION
}

ePub.Book = Book
ePub.Rendition = Rendition
ePub.Contents = Contents
ePub.CFI = CFI
ePub.utils = utils

export default ePub
