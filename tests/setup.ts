import '@testing-library/jest-dom';

// Clear localStorage after every test so persistence state doesn't leak between tests.
afterEach(() => {
  localStorage.clear();
});
