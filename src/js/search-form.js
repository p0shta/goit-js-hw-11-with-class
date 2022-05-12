import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import fetchImages from './api-service.js';

let gallery = new SimpleLightbox('.gallery a');
gallery.on('show.simplelightbox', function () {});

const refs = {
  searchForm: document.querySelector('#search-form'),
  galleryList: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.js-load-btn'),
};

let searchQuery = '';
let paginationPageValue = 1;

refs.searchForm.addEventListener('submit', onSubmit);
async function onSubmit(e) {
  e.preventDefault();

  searchQuery = refs.searchForm.children[0].value;
  refs.searchForm.children[0].value = '';

  if (searchQuery === '') {
    return Notify.failure('Please, enter something');
  }

  if (searchQuery !== '') {
    refs.galleryList.innerHTML = '';
    paginationPageValue = 1;
    refs.loadBtn.classList.add('visually-hidden');
  }

  try {
    const dataImages = await fetchImages(searchQuery, paginationPageValue);

    if (dataImages.length === 0) {
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (dataImages.length < 40) {
      renderGalleryItems(dataImages);
    } else {
      renderGalleryItems(dataImages);
      refs.loadBtn.classList.remove('visually-hidden');
    }
  } catch (error) {
    Notify.failure(error.message);
  }
}

refs.loadBtn.addEventListener('click', onLoadBtnClick);
async function onLoadBtnClick() {
  paginationPageValue += 1;

  const dataImages = await fetchImages(searchQuery, paginationPageValue);

  if (dataImages.length < 40) {
    renderGalleryItems(dataImages);

    refs.loadBtn.classList.add('visually-hidden');
    Notify.warning(`We're sorry, but you've reached the end of search results.`);
  }

  renderGalleryItems(dataImages);
}

function makeGalleryMarkup(data) {
  const markup = data
    .map(item => {
      const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = item;

      return `
      <a href="${largeImageURL}">
        <div class="card">
          <img class="card__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="card__info">
            <p class="card__info-item">
              <b>Likes</b>
              <span class="card__info-value">${likes}</span>
            </p>
            <p class="card__info-item">
              <b>Views</b>        
              <span class="card__info-value">${views}</span>

            </p>
            <p class="card__info-item">
              <b>Comments</b>
              <span class="card__info-value">${comments}</span>

            </p>
            <p class="card__info-item">
              <b>Downloads</b>
              <span class="card__info-value">${downloads}</span>

            </p>
          </div>
        </div>
      </a>
      `;
    })
    .join('');
  return markup;
}

function renderGalleryItems(dataImages) {
  const imagesMarkup = makeGalleryMarkup(dataImages);
  refs.galleryList.insertAdjacentHTML('beforeend', imagesMarkup);
  gallery.refresh();
}
