'use strict';

const storageKeys = {
  favorites: 'northStarBakeryFavorites',
  visitorProfile: 'northStarBakeryVisitorProfile'
};

const productCatalog = [
  { id: 'country-sourdough', name: 'Country Sourdough', category: 'Bread' },
  { id: 'honey-oat', name: 'Honey Oat', category: 'Bread' },
  { id: 'butter-croissants', name: 'Butter Croissants', category: 'Pastry' },
  { id: 'seasonal-fruit-danish', name: 'Seasonal Fruit Danish', category: 'Pastry' },
  { id: 'celebration-cakes', name: 'Celebration Cakes', category: 'Cake' }
];

const validationMessages = {
  nameRequired: 'Please enter your name.',
  nameLength: 'Please enter at least 2 characters for your name.',
  emailRequired: 'Please enter your email address.',
  emailFormat: 'Please enter a valid email address, such as name@example.com.',
  pickupRequired: 'Please choose a preferred pickup date.',
  pickupPast: 'Please choose today or a future pickup date.',
  requestType: 'Please choose either Pre-order or General question.',
  detailsRequired: 'Please tell us what you need.',
  detailsLength: 'Please provide at least 10 characters so we can understand your request.'
};

function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getFavorites() {
  const saved = loadJson(storageKeys.favorites, []);
  return Array.isArray(saved) ? saved.filter(id => productCatalog.some(product => product.id === id)) : [];
}

function saveFavorites(favorites) {
  saveJson(storageKeys.favorites, favorites);
}

function productById(id) {
  return productCatalog.find(product => product.id === id);
}

function renderFavoriteButtons() {
  const favorites = getFavorites();
  document.querySelectorAll('[data-favorite-id]').forEach(button => {
    const id = button.dataset.favoriteId;
    const selected = favorites.includes(id);
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = selected ? 'Remove from favorites' : 'Save as favorite';
    button.classList.toggle('is-favorite', selected);
  });
}

function renderFavoriteSummary() {
  const panel = document.querySelector('#favorites-panel');
  const list = document.querySelector('#favorites-list');
  const count = document.querySelector('#favorites-count');
  const clearButton = document.querySelector('#clear-favorites');
  if (!panel || !list || !count || !clearButton) return;

  const favorites = getFavorites();
  list.innerHTML = '';
  favorites.forEach(id => {
    const product = productById(id);
    if (!product) return;
    const item = document.createElement('li');
    item.textContent = `${product.name} (${product.category})`;
    list.appendChild(item);
  });

  count.textContent = favorites.length === 1 ? '1 saved favorite' : `${favorites.length} saved favorites`;
  panel.classList.toggle('has-favorites', favorites.length > 0);
  clearButton.hidden = favorites.length === 0;

  if (favorites.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'Choose items below to build a short list for your next bakery visit.';
    list.appendChild(item);
  }
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  const nextFavorites = favorites.includes(id)
    ? favorites.filter(itemId => itemId !== id)
    : [...favorites, id];
  saveFavorites(nextFavorites);
  renderFavoriteButtons();
  renderFavoriteSummary();

  const status = document.querySelector('#favorite-status');
  const product = productById(id);
  if (status && product) {
    status.textContent = nextFavorites.includes(id)
      ? `${product.name} was saved to your favorites.`
      : `${product.name} was removed from your favorites.`;
  }
}

function setupFavoritesFeature() {
  if (!document.querySelector('[data-favorite-id]')) return;

  document.querySelectorAll('[data-favorite-id]').forEach(button => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.favoriteId));
  });

  const clearButton = document.querySelector('#clear-favorites');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      saveFavorites([]);
      renderFavoriteButtons();
      renderFavoriteSummary();
      const status = document.querySelector('#favorite-status');
      if (status) status.textContent = 'Your saved favorites were cleared.';
    });
  }

  renderFavoriteButtons();
  renderFavoriteSummary();
}

function setFieldError(field, message) {
  const error = document.querySelector(`#${field.id}-error`);
  if (error) error.textContent = message;
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validateName(field) {
  const value = field.value.trim();
  if (!value) return validationMessages.nameRequired;
  if (value.length < 2) return validationMessages.nameLength;
  return '';
}

function validateEmail(field) {
  const value = field.value.trim();
  if (!value) return validationMessages.emailRequired;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailPattern.test(value)) return validationMessages.emailFormat;
  return '';
}

function validatePickupDate(field) {
  if (!field.value) return validationMessages.pickupRequired;
  const selected = new Date(`${field.value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selected < today) return validationMessages.pickupPast;
  return '';
}

function validateDetails(field) {
  const value = field.value.trim();
  if (!value) return validationMessages.detailsRequired;
  if (value.length < 10) return validationMessages.detailsLength;
  return '';
}

function validateRequestType(form) {
  const checked = form.querySelector('input[name="request-type"]:checked');
  const error = document.querySelector('#request-type-error');
  const message = checked ? '' : validationMessages.requestType;
  if (error) error.textContent = message;
  form.querySelectorAll('input[name="request-type"]').forEach(input => {
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  });
  return !message;
}

function validateForm(form) {
  const name = form.querySelector('#name');
  const email = form.querySelector('#email');
  const pickupDate = form.querySelector('#pickup-date');
  const details = form.querySelector('#details');

  const validators = [
    [name, validateName],
    [email, validateEmail],
    [pickupDate, validatePickupDate],
    [details, validateDetails]
  ];

  let valid = true;
  validators.forEach(([field, validator]) => {
    const message = validator(field);
    setFieldError(field, message);
    if (message) valid = false;
  });

  if (!validateRequestType(form)) valid = false;
  return valid;
}

function saveVisitorProfile(form) {
  const profile = {
    name: form.querySelector('#name').value.trim(),
    email: form.querySelector('#email').value.trim()
  };
  saveJson(storageKeys.visitorProfile, profile);
  renderStorageStatus(profile);
}

function restoreVisitorProfile(form) {
  const profile = loadJson(storageKeys.visitorProfile, {});
  const name = form.querySelector('#name');
  const email = form.querySelector('#email');

  if (profile && typeof profile === 'object') {
    if (profile.name && !name.value) name.value = profile.name;
    if (profile.email && !email.value) email.value = profile.email;
  }
  renderStorageStatus(profile);
}

function renderStorageStatus(profile) {
  const status = document.querySelector('#storage-status');
  if (!status) return;
  const favorites = getFavorites();
  const hasProfile = profile && profile.name && profile.email;
  const favoriteText = favorites.length === 1 ? '1 favorite' : `${favorites.length} favorites`;

  if (hasProfile || favorites.length > 0) {
    status.innerHTML = `<strong>Remembered in this browser:</strong> ${hasProfile ? `${profile.name} and ${profile.email}` : 'no contact profile yet'}; ${favoriteText}.`;
  } else {
    status.textContent = 'Nothing has been saved in this browser yet.';
  }
}

function renderSavedFavoritesForForm() {
  const list = document.querySelector('#saved-favorites-contact');
  const button = document.querySelector('#use-favorites');
  if (!list || !button) return;

  const favorites = getFavorites().map(productById).filter(Boolean);
  list.innerHTML = '';
  favorites.forEach(product => {
    const item = document.createElement('li');
    item.textContent = product.name;
    list.appendChild(item);
  });

  if (favorites.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'No saved favorites yet. You can save products on the Products page.';
    list.appendChild(item);
    button.disabled = true;
  } else {
    button.disabled = false;
  }
}

function fillFavoritesIntoDetails() {
  const details = document.querySelector('#details');
  const favorites = getFavorites().map(productById).filter(Boolean);
  if (!details || favorites.length === 0) return;

  const favoriteLine = `Saved favorites: ${favorites.map(product => product.name).join(', ')}.`;
  if (!details.value.includes('Saved favorites:')) {
    details.value = details.value.trim() ? `${favoriteLine}\n${details.value.trim()}` : favoriteLine;
  }
  details.focus();
  setFieldError(details, validateDetails(details));
}

function setupFormValidation() {
  const form = document.querySelector('#request-form');
  if (!form) return;

  restoreVisitorProfile(form);
  renderSavedFavoritesForForm();
  renderStorageStatus(loadJson(storageKeys.visitorProfile, {}));

  const fieldValidators = {
    name: validateName,
    email: validateEmail,
    'pickup-date': validatePickupDate,
    details: validateDetails
  };

  Object.entries(fieldValidators).forEach(([id, validator]) => {
    const field = form.querySelector(`#${id}`);
    field.addEventListener('blur', () => setFieldError(field, validator(field)));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        setFieldError(field, validator(field));
      }
    });
  });

  form.querySelectorAll('input[name="request-type"]').forEach(input => {
    input.addEventListener('change', () => validateRequestType(form));
  });

  const useFavorites = document.querySelector('#use-favorites');
  if (useFavorites) useFavorites.addEventListener('click', fillFavoritesIntoDetails);

  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = document.querySelector('#form-status');

    if (!validateForm(form)) {
      if (message) {
        message.className = 'form-status error-summary';
        message.textContent = 'Please correct the highlighted fields before sending your request.';
      }
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    saveVisitorProfile(form);
    if (message) {
      message.className = 'form-status success-summary';
      message.textContent = 'Your request passed validation. This demonstration keeps the form on this page rather than sending data to a server.';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupFavoritesFeature();
  setupFormValidation();
});
