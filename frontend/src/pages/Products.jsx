import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiSearch, HiAdjustments, HiX, HiSparkles } from 'react-icons/hi';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import jsonProducts from '../data/products.json';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiProducts, setApiProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const itemsPerPage = 8;

  // Extract categories dynamically from JSON & API
  const allCategories = useMemo(() => {
    const catsFromJSON = jsonProducts.map(p => p.category);
    const combined = Array.from(new Set([...catsFromJSON, ...categories])).filter(Boolean);
    return combined;
  }, [categories]);

  useEffect(() => {
    // Attempt fetching live categories from Backend if server is up
    API.get('/products/categories')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) setCategories(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    params.set('page', page);

    // Fetch from backend API, fallback smoothly to JSON data
    API.get(`/products?${params}`)
      .then(res => {
        if (res.data?.products && res.data.products.length > 0) {
          setApiProducts(res.data.products);
        } else {
          setApiProducts([]);
        }
      })
      .catch(() => {
        setApiProducts([]);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  // Compute final product list combining local JSON file + backend API items
  const processedProducts = useMemo(() => {
    // Combine API products and JSON products (avoiding duplicate IDs)
    const combinedMap = new Map();
    jsonProducts.forEach(p => combinedMap.set(p.id || p._id, p));
    apiProducts.forEach(p => combinedMap.set(p._id || p.id, p));

    let list = Array.from(combinedMap.values());

    // 1. Filter by Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // 2. Filter by Category
    if (category) {
      list = list.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }

    // 3. Apply Sorting
    if (sort === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [apiProducts, search, category, sort]);

  // Pagination logic
  const totalProducts = processedProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return processedProducts.slice(start, start + itemsPerPage);
  }, [processedProducts, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Banner */}
      <div className="mb-8 p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-dark-light via-surface to-dark-light border border-primary/20 shadow-2xl animate-float">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
            <HiSparkles /> Curated Collections & Local JSON Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
            {category ? `${category} Collection` : 'Explore All Products'}
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            Discover top-tier tech accessories, wearables, audio gear, and fashion items loaded instantly.
          </p>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-gray-300 text-sm font-medium">
            Showing <span className="text-white font-bold">{totalProducts}</span> products
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {search && (
            <div className="flex items-center gap-1.5 glass rounded-xl px-3 py-2 text-sm text-primary border border-primary/20">
              <HiSearch className="text-sm" /> "{search}"
              <button onClick={() => updateParam('search', '')} className="ml-1 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer">
                <HiX className="text-sm" />
              </button>
            </div>
          )}

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={e => updateParam('sort', e.target.value)}
            className="bg-white/5 border border-primary/15 focus:border-primary rounded-xl py-2 px-3 text-white text-sm cursor-pointer outline-none"
            style={{ minWidth: '150px' }}
          >
            <option value="" className="bg-gray-900 text-white">Sort by: Featured</option>
            <option value="price_asc" className="bg-gray-900 text-white">Price: Low to High</option>
            <option value="price_desc" className="bg-gray-900 text-white">Price: High to Low</option>
            <option value="rating" className="bg-gray-900 text-white">Top Rated</option>
            <option value="name" className="bg-gray-900 text-white">Name A-Z</option>
          </select>

          <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden btn-secondary py-2 px-3">
            <HiAdjustments className="text-lg" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex p-4' : 'hidden'} md:block md:relative md:bg-transparent md:z-auto w-64 flex-shrink-0`}>
          <div className={`glass-strong rounded-2xl p-6 w-64 h-fit border border-white/10 ${filtersOpen ? 'm-auto max-h-[90vh] overflow-y-auto' : ''}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base tracking-wide">Categories</h3>
              {filtersOpen && (
                <button onClick={() => setFiltersOpen(false)} className="text-white md:hidden bg-transparent border-none cursor-pointer">
                  <HiX className="text-xl" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 mb-6">
              <button
                onClick={() => { updateParam('category', ''); setFiltersOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all border-none cursor-pointer ${
                  !category
                    ? 'bg-primary text-dark font-bold shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/5 bg-transparent'
                }`}
              >
                All Categories
              </button>
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { updateParam('category', cat); setFiltersOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all border-none cursor-pointer ${
                    category.toLowerCase() === cat.toLowerCase()
                      ? 'bg-primary text-dark font-bold shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {(category || search || sort) && (
              <button onClick={clearFilters} className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition flex items-center justify-center gap-2 border-none cursor-pointer">
                <HiX /> Reset Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse rounded-2xl overflow-hidden bg-white/5 h-80" />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20 glass-strong rounded-3xl p-8 border border-white/10">
              <p className="text-gray-300 text-lg font-medium mb-4">No products found matching your search criteria.</p>
              <button onClick={clearFilters} className="btn-primary py-2.5 px-6 rounded-xl">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam('page', String(i + 1))}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border-none cursor-pointer ${
                        page === i + 1
                          ? 'bg-primary text-dark font-bold shadow-lg shadow-primary/20'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
