/**
 * ImageManager.jsx
 * Path: src/pages/Admin/ImageManager.jsx
 * Description: Image management page for admin panel
 * Version: 1.0 - New page
 * Features:
 * - ✅ Grid view of uploaded images
 * - ✅ Search and filter
 * - ✅ Sort by date, name, size
 * - ✅ Bulk delete
 * - ✅ Image details modal
 * - ✅ Copy URL
 * - ✅ Storage usage stats
 * - ✅ Upload new images
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  Copy,
  Check,
  Grid,
  List,
  Filter,
  Download,
  HardDrive,
  Image as ImageIcon,
} from "lucide-react";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import Card from "@components/ui/Card";
import Modal from "@components/ui/Modal";
import EmptyState from "@components/ui/EmptyState";
import Skeleton from "@components/ui/Skeleton";
import MediaUploader from "@components/admin/MediaUploader";
import { useToast } from "@components/ui/Toast";
import { cn, formatDate, formatNumber } from "@utils/helpers";

// ============================================
// 🔄 ImageManager Component
// ============================================

const ImageManager = () => {
  // ============================================
  // 📊 State
  // ============================================

  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [showUploader, setShowUploader] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [stats, setStats] = useState({ totalImages: 0, totalSize: 0 });

  const toast = useToast();

  // ============================================
  // 📡 Fetch Images
  // ============================================

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/media", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setImages(data.data.images || []);
        setStats({
          totalImages: data.data.total || 0,
          totalSize: data.data.totalSize || 0,
        });
      }
    } catch (error) {
      toast.error("خطا در بارگذاری تصاویر");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // ============================================
  // 🔍 Filtered and Sorted Images
  // ============================================

  const filteredImages = useMemo(() => {
    let result = [...images];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (img) =>
          img.name?.toLowerCase().includes(term) ||
          img.url?.toLowerCase().includes(term),
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "size":
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case "date":
        default:
          comparison =
            new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [images, searchTerm, sortBy, sortOrder]);

  // ============================================
  // 📋 Copy URL
  // ============================================

  const handleCopyUrl = async (image) => {
    try {
      await navigator.clipboard.writeText(image.url);
      setCopiedId(image.id);
      toast.success("URL کپی شد");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("خطا در کپی URL");
    }
  };

  // ============================================
  // 🗑️ Delete Image
  // ============================================

  const handleDelete = async (imageId) => {
    if (!confirm("آیا از حذف این تصویر مطمئن هستید؟")) return;

    try {
      const response = await fetch(`/api/admin/media/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        toast.success("تصویر حذف شد");
      }
    } catch (error) {
      toast.error("خطا در حذف تصویر");
    }
  };

  // ============================================
  // 🗑️ Bulk Delete
  // ============================================

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    if (!confirm(`آیا از حذف ${selectedImages.size} تصویر مطمئن هستید؟`)) return;

    for (const imageId of selectedImages) {
      await handleDelete(imageId);
    }

    setSelectedImages(new Set());
  };

  // ============================================
  // ☑️ Toggle Selection
  // ============================================

  const toggleSelection = (imageId) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            مدیریت تصاویر
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            آپلود، مدیریت و حذف تصاویر
          </p>
        </div>

        <Button onClick={() => setShowUploader(!showUploader)}>
          {showUploader ? "بستن آپلودر" : "آپلود تصویر جدید"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-950">
              <ImageIcon className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">تعداد تصاویر</p>
              <p className="text-lg font-bold">
                {formatNumber(stats.totalImages)}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success-100 dark:bg-success-950">
              <HardDrive className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">حجم کل</p>
              <p className="text-lg font-bold">
                {(stats.totalSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-950">
              <Filter className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">فیلتر شده</p>
              <p className="text-lg font-bold">{formatNumber(filteredImages.length)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Uploader */}
      <AnimatePresence>
        {showUploader && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card padding="lg">
              <h3 className="text-lg font-bold mb-4">آپلود تصویر جدید</h3>
              <MediaUploader
                multiple
                onUpload={(file) => {
                  setImages((prev) => [file, ...prev]);
                  fetchImages();
                }}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="جستجو بر اساس نام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
            clearable
            onClear={() => setSearchTerm("")}
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
        >
          <option value="date">تاریخ</option>
          <option value="name">نام</option>
          <option value="size">حجم</option>
        </select>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "صعودی" : "نزولی"}
        </Button>

        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "primary" : "ghost"}
            size="sm"
            iconOnly
            icon={Grid}
            onClick={() => setViewMode("grid")}
            ariaLabel="نمایش شبکه‌ای"
          />
          <Button
            variant={viewMode === "list" ? "primary" : "ghost"}
            size="sm"
            iconOnly
            icon={List}
            onClick={() => setViewMode("list")}
            ariaLabel="نمایش لیستی"
          />
        </div>

        {selectedImages.size > 0 && (
          <Button variant="danger" size="sm" icon={Trash2} onClick={handleBulkDelete}>
            حذف ({selectedImages.size})
          </Button>
        )}
      </div>

      {/* Images */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Skeleton variant="card" count={12} />
        </div>
      ) : filteredImages.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="هیچ تصویری یافت نشد"
          description={searchTerm ? "با جستجوی دیگری امتحان کنید" : "هنوز تصویری آپلود نشده است"}
          actionLabel="آپلود تصویر"
          onAction={() => setShowUploader(true)}
        />
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredImages.map((image) => (
            <Card
              key={image.id}
              padding="none"
              hover
              className="group !p-0 overflow-hidden"
              onClick={() => setShowDetails(image)}
            >
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />

                {/* Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(image.id);
                  }}
                  className={cn(
                    "absolute top-2 right-2 w-6 h-6 rounded border-2 transition-all",
                    selectedImages.has(image.id)
                      ? "bg-primary-500 border-primary-500"
                      : "bg-white/80 border-white opacity-0 group-hover:opacity-100",
                  )}
                  aria-label="انتخاب"
                >
                  {selectedImages.has(image.id) && <Check className="w-4 h-4 text-white" />}
                </button>
              </div>

              <div className="p-2">
                <p className="text-xs truncate">{image.name}</p>
                <p className="text-xs text-neutral-400">
                  {(image.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <Card padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  تصویر
                </th>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  نام
                </th>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  حجم
                </th>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  تاریخ
                </th>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map((image) => (
                <tr
                  key={image.id}
                  className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                >
                  <td className="p-3">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </td>
                  <td className="p-3 text-sm">{image.name}</td>
                  <td className="p-3 text-sm text-neutral-500">
                    {(image.size / 1024).toFixed(0)} KB
                  </td>
                  <td className="p-3 text-sm text-neutral-500">
                    {image.createdAt ? formatDate(image.createdAt) : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={copiedId === image.id ? Check : Copy}
                        onClick={() => handleCopyUrl(image)}
                        ariaLabel="کپی URL"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={Trash2}
                        onClick={() => handleDelete(image.id)}
                        ariaLabel="حذف"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={Boolean(showDetails)}
        onClose={() => setShowDetails(null)}
        title="جزئیات تصویر"
        size="lg"
      >
        {showDetails && (
          <div className="space-y-4">
            <img
              src={showDetails.url}
              alt={showDetails.name}
              className="w-full rounded-xl"
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500">نام فایل:</p>
                <p className="font-medium">{showDetails.name}</p>
              </div>
              <div>
                <p className="text-neutral-500">حجم:</p>
                <p className="font-medium">
                  {(showDetails.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <div>
                <p className="text-neutral-500">تاریخ آپلود:</p>
                <p className="font-medium">
                  {showDetails.createdAt
                    ? formatDate(showDetails.createdAt)
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">URL:</p>
                <p className="font-mono text-xs truncate">{showDetails.url}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                icon={copiedId === showDetails.id ? Check : Copy}
                onClick={() => handleCopyUrl(showDetails)}
              >
                کپی URL
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  handleDelete(showDetails.id);
                  setShowDetails(null);
                }}
              >
                حذف
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ImageManager;
