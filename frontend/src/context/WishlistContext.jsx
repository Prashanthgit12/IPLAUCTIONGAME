import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext();

const STORAGE_KEY = 'auctionx_target_board';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.error('Failed to persist wishlist:', err);
    }
  }, [wishlist]);

  const isWishlisted = useCallback(
    (playerId) => {
      if (!playerId) return false;
      return wishlist.some((item) => (item.player?._id || item.player) === playerId);
    },
    [wishlist]
  );

  const getWishlistEntry = useCallback(
    (playerId) => {
      if (!playerId) return null;
      return wishlist.find((item) => (item.player?._id || item.player) === playerId) || null;
    },
    [wishlist]
  );

  const toggleWishlist = useCallback((player, targetBudget = null) => {
    if (!player || !player._id) return;

    setWishlist((prev) => {
      const exists = prev.some((item) => (item.player?._id || item.player) === player._id);
      if (exists) {
        return prev.filter((item) => (item.player?._id || item.player) !== player._id);
      } else {
        const defaultBudget = targetBudget || player.basePrice * 2 || 20000000;
        return [
          ...prev,
          {
            player,
            targetBudget: defaultBudget,
            addedAt: new Date().toISOString()
          }
        ];
      }
    });
  }, []);

  const updateTargetBudget = useCallback((playerId, budget) => {
    setWishlist((prev) =>
      prev.map((item) => {
        if ((item.player?._id || item.player) === playerId) {
          return { ...item, targetBudget: Number(budget) };
        }
        return item;
      })
    );
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isWishlisted,
        getWishlistEntry,
        toggleWishlist,
        updateTargetBudget,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
