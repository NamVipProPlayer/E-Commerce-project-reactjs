import { useState, useEffect } from "react";
import { Label } from "@component/ui/Label/Label.jsx";
import { Checkbox } from "@component/ui/CheckBox/CheckBox.jsx";
import { ArrowLeftIcon, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./stylesSidebar.module.scss";
import { useNavigation } from "@Hooks/useNavigate.js";

const SaleFilterSection = ({ filters, onChange }) => {
    return (
        <div className={styles.filterSection}>
            <h3>Special Offers</h3>
            <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={filters.onSale}
                        onChange={(e) => {
                            onChange({
                                ...filters,
                                onSale: e.target.checked
                            });
                        }}
                    />
                    <span>On Sale Items</span>
                </label>
            </div>
        </div>
    );
};

export default function Sidebarss({ onFilterChange, initialCategory }) {
    const { handleNavigation } = useNavigation();

    // Map navigation state categories to sidebar categories
    const categoryMapping = {
        Men: "Man's Shoes",
        Women: "Women's shoes"
    };

    // Initialize filters with mapped initialCategory if available
    const [filters, setFilters] = useState(() => {
        let initialFilters = {
            category: [],
            price: null,
            colorSearch: "",
            onSale: false
        };

        if (initialCategory) {
            // Map the initialCategory to the correct format
            const mappedCategory =
                categoryMapping[initialCategory] || initialCategory;
            initialFilters.category = [mappedCategory];
        }

        return initialFilters;
    });

    // Section collapse state
    const [isOpen, setIsOpen] = useState({
        gender: true, // Open by default when category is selected
        price: false,
        color: false
    });

    // Update filters when initialCategory changes
    useEffect(() => {
        if (initialCategory) {
            // Map the initialCategory to the correct format
            const mappedCategory =
                categoryMapping[initialCategory] || initialCategory;

            setFilters((prev) => ({
                ...prev,
                category: [mappedCategory]
            }));

            // Open the gender section when category is provided
            setIsOpen((prev) => ({
                ...prev,
                gender: true
            }));
        }
    }, [initialCategory]);

    // Send filter changes to parent component
    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    // Toggle section visibility
    const toggleSection = (section) => {
        setIsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    // Handle category checkbox changes
    const handleCheckboxChange = (category) => {
        setFilters((prev) => {
            const newCategory = prev.category.includes(category)
                ? prev.category.filter((c) => c !== category)
                : [...prev.category, category];

            return {
                ...prev,
                category: newCategory
            };
        });
    };

    // Handle price filter changes
    const handlePriceChange = (order) => {
        setFilters((prev) => ({
            ...prev,
            price: prev.price === order ? null : order // Toggle selection
        }));
    };

    // Handle color search input
    const handleColorSearch = (event) => {
        setFilters((prev) => ({
            ...prev,
            colorSearch: event.target.value
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            category: [],
            price: null,
            colorSearch: "",
            onSale: false
        });
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.section}>
                <h1>Shoes</h1>
            </div>

            {/* SALE FILTER - Moved to the top */}
            <SaleFilterSection filters={filters} onChange={setFilters} />

            {/* CATEGORY FILTER */}
            <div className={styles.section}>
                <h3
                    onClick={() => toggleSection("gender")}
                    className={styles.dropdownHeader}
                >
                    Gender
                    {isOpen.gender ? <ChevronUp /> : <ChevronDown />}
                </h3>
                {isOpen.gender && (
                    <div className={styles.dropdownContent}>
                        {["Women's shoes", "Man's Shoes"].map((category) => (
                            <div key={category} className={styles.checkboxItem}>
                                <Checkbox
                                    id={category}
                                    checked={filters.category.includes(
                                        category
                                    )}
                                    onCheckedChange={() =>
                                        handleCheckboxChange(category)
                                    }
                                />
                                <Label htmlFor={category}>{category}</Label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PRICE FILTER (Sorting) */}
            <div className={styles.section}>
                <h3
                    onClick={() => toggleSection("price")}
                    className={styles.dropdownHeader}
                >
                    Sort by Price
                    {isOpen.price ? <ChevronUp /> : <ChevronDown />}
                </h3>
                {isOpen.price && (
                    <div className={styles.dropdownContent}>
                        <div className={styles.checkboxItem}>
                            <Checkbox
                                id="highToLow"
                                checked={filters.price === "desc"}
                                onCheckedChange={() =>
                                    handlePriceChange("desc")
                                }
                            />
                            <Label htmlFor="highToLow">High to Low</Label>
                        </div>
                        <div className={styles.checkboxItem}>
                            <Checkbox
                                id="lowToHigh"
                                checked={filters.price === "asc"}
                                onCheckedChange={() => handlePriceChange("asc")}
                            />
                            <Label htmlFor="lowToHigh">Low to High</Label>
                        </div>
                    </div>
                )}
            </div>

            {/* COLOR FILTER (Search Input) */}
            <div className={styles.section}>
                <h3
                    onClick={() => toggleSection("color")}
                    className={styles.dropdownHeader}
                >
                    Search by Color
                    {isOpen.color ? <ChevronUp /> : <ChevronDown />}
                </h3>
                {isOpen.color && (
                    <div className={styles.dropdownContent}>
                        <input
                            type="text"
                            placeholder="Search color..."
                            value={filters.colorSearch}
                            onChange={handleColorSearch}
                            className="form-control"
                        />
                    </div>
                )}
            </div>

            <div className={styles.backButton}>
                <ArrowLeftIcon />
                <span
                    className={styles.spanContent}
                    onClick={() => handleNavigation("/")}
                >
                    Back to Home Page
                </span>
            </div>
        </aside>
    );
}
