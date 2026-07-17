// TODO: Implement custom React hooks for page flipping, fonts scaling, reading timers.
export function useReader() {
  return {
    currentPage: 1,
    totalPages: 100,
    text: '',
    nextPage: () => {},
    prevPage: () => {},
    jumpToPage: () => {},
  };
}
