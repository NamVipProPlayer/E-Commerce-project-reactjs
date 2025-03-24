import { useState, useEffect, useContext } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "./ui/dialog.jsx";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "./ui/form.jsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select.jsx";
import { Input } from "./ui/input.jsx";
import { Button } from "./ui/button.jsx";
import { Textarea } from "./ui/textarea.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    Package,
    DollarSign,
    User,
    MapPin,
    Truck,
    CreditCard,
    AlertCircle,
    Clock,
    CalendarDays
} from "lucide-react";
import styles from "./stylesOrderUpdateForm.module.scss";
import {getCurrentFormattedDateTime} from "@component/utils/dateTimeUtils.js"
import { StorageContext } from "@Contexts/StorageProvider";
// Form validation schema
const formSchema = z.object({
    orderStatus: z.enum(["Processing", "Shipped", "Delivered", "Cancelled"]),
    paymentStatus: z.enum(["Pending", "Paid", "Failed", "Refunded"]),
    trackingCarrier: z.string().optional(),
    trackingNumber: z.string().optional(),
    estimatedDeliveryDate: z.string().optional(),
    customerNotes: z.string().optional(),
    // Add shipping address fields
    houseNumber: z.string().min(1, "House number is required"),
    street: z.string().min(1, "Street is required"),
    ward: z.string().min(1, "Ward is required"),
    district: z.string().min(1, "District is required"),
    cityOrProvince: z.string().min(1, "City/Province is required"),
    phoneNumber: z.string().min(1, "Phone number is required")
});

export function OrderUpdateForm({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
    orderData
}) {
    const [isAddressEditable, setIsAddressEditable] = useState(false);
    const {userInfo} = useContext(StorageContext);


    // Create form
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            orderStatus: "Processing",
            paymentStatus: "Pending",
            trackingCarrier: "",
            trackingNumber: "",
            estimatedDeliveryDate: "",
            customerNotes: "",
            houseNumber: "",
            street: "",
            ward: "",
            district: "",
            cityOrProvince: "",
            phoneNumber: ""
        }
    });

    // Update form values when orderData changes
    useEffect(() => {
        if (orderData) {
            form.reset({
                orderStatus: orderData.orderStatus || "Processing",
                paymentStatus: orderData.paymentStatus || "Pending",
                trackingCarrier: orderData.tracking?.carrier || "",
                trackingNumber: orderData.tracking?.trackingNumber || "",
                estimatedDeliveryDate: orderData.tracking?.estimatedDeliveryDate
                    ? format(
                          new Date(orderData.tracking.estimatedDeliveryDate),
                          "yyyy-MM-dd"
                      )
                    : "",
                customerNotes: orderData.customerNotes || "",
                // Set shipping address fields
                houseNumber: orderData.shippingAddress?.houseNumber || "",
                street: orderData.shippingAddress?.street || "",
                ward: orderData.shippingAddress?.ward || "",
                district: orderData.shippingAddress?.district || "",
                cityOrProvince: orderData.shippingAddress?.cityOrProvince || "",
                phoneNumber: orderData.shippingAddress?.phoneNumber || ""
            });
        }
    }, [orderData, form]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    };

    // Handler for form submission
   const handleFormSubmit = (data) => {
       // Check if we have order data
       if (!orderData || !orderData._id) {
           console.error("Missing order data for update");
           return;
       }

       // Log the form values for debugging
       console.log("Form values submitted:", data);

       // Format the data for API submission
       const formattedData = {
           ...orderData, // Keep other order data
           orderStatus: data.orderStatus,
           paymentStatus: data.paymentStatus,
           tracking: {
               carrier: data.trackingCarrier,
               trackingNumber: data.trackingNumber,
               estimatedDeliveryDate: data.estimatedDeliveryDate
                   ? new Date(data.estimatedDeliveryDate).toISOString()
                   : null
           },
           customerNotes: data.customerNotes,
           shippingAddress: {
               houseNumber: data.houseNumber,
               street: data.street,
               ward: data.ward,
               district: data.district,
               cityOrProvince: data.cityOrProvince,
               phoneNumber: data.phoneNumber
           }
       };

       console.log("Formatted data being sent to parent:", formattedData);

       // Pass both order ID and formatted data to parent component
       onSubmit(orderData._id, formattedData);
   };

    if (!orderData) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={styles.dialogContent}>
                <DialogHeader>
                    <DialogTitle className={styles.dialogTitle}>
                        <Package className={styles.titleIcon} /> Update Order
                        Details
                    </DialogTitle>
                    <DialogDescription>
                        Order ID:{" "}
                        <span className={styles.orderId}>
                            #
                            {orderData._id
                                ?.substring(orderData._id.length - 8)
                                .toUpperCase()}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className={styles.orderSummary}>
                    <div className={styles.summaryItem}>
                        <div className={styles.summaryLabel}>
                            <User size={16} /> Customer
                        </div>
                        <div className={styles.summaryValue}>
                            {orderData.user?.name || "Anonymous"}
                        </div>
                    </div>

                    <div className={styles.summaryItem}>
                        <div className={styles.summaryLabel}>
                            <DollarSign size={16} /> Total
                        </div>
                        <div className={styles.summaryValue}>
                            {formatCurrency(
                                orderData.finalAmount ||
                                    orderData.totalAmount ||
                                    0
                            )}
                        </div>
                    </div>

                    <div className={styles.summaryItem}>
                        <div className={styles.summaryLabel}>
                            <CreditCard size={16} /> Payment Method
                        </div>
                        <div className={styles.summaryValue}>
                            {orderData.paymentMethod || "N/A"}
                        </div>
                    </div>

                    <div className={styles.summaryItem}>
                        <div className={styles.summaryLabel}>
                            <CalendarDays size={16} /> Ordered On
                        </div>
                        <div className={styles.summaryValue}>
                            {formatDate(orderData.orderedAt)}
                        </div>
                    </div>
                </div>

                <div className={styles.items}>
                    <h3 className={styles.itemsTitle}>
                        <Package size={16} /> Items (
                        {orderData.items?.length || 0})
                    </h3>
                    <div className={styles.itemsList}>
                        {orderData.items?.map((item, index) => (
                            <div key={index} className={styles.item}>
                                <div className={styles.itemName}>
                                    {item.product?.name || "Product"} - Size:{" "}
                                    {item.size}
                                </div>
                                <div className={styles.itemDetails}>
                                    <span className={styles.itemQuantity}>
                                        Qty: {item.quantity}
                                    </span>
                                    <span className={styles.itemPrice}>
                                        {formatCurrency(item.price || 0)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ⚠️ FIX: Use a div instead of Form component to avoid nesting forms */}
                <div className={styles.form}>
                    {/* ⚠️ FIX: Use onSubmit function properly, not as a DOM attribute */}
                    <div onSubmit={form.handleSubmit(handleFormSubmit)}>
                        <div className={styles.formGrid}>
                            <div className={styles.formSection}>
                                <h3 className={styles.sectionTitle}>
                                    <Clock size={16} /> Order Status
                                </h3>
                                <FormField
                                    control={form.control}
                                    name="orderStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Order Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Processing">
                                                        Processing
                                                    </SelectItem>
                                                    <SelectItem value="Shipped">
                                                        Shipped
                                                    </SelectItem>
                                                    <SelectItem value="Delivered">
                                                        Delivered
                                                    </SelectItem>
                                                    <SelectItem value="Cancelled">
                                                        Cancelled
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="paymentStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Payment Status
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Pending">
                                                        Pending
                                                    </SelectItem>
                                                    <SelectItem value="Paid">
                                                        Paid
                                                    </SelectItem>
                                                    <SelectItem value="Failed">
                                                        Failed
                                                    </SelectItem>
                                                    <SelectItem value="Refunded">
                                                        Refunded
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className={styles.formSection}>
                                <h3 className={styles.sectionTitle}>
                                    <Truck size={16} /> Tracking Information
                                </h3>
                                <FormField
                                    control={form.control}
                                    name="trackingCarrier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Carrier</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., FedEx, UPS"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="trackingNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Tracking Number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter tracking number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="estimatedDeliveryDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Estimated Delivery Date
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.sectionTitle}>
                                    <MapPin size={16} /> Shipping Address
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setIsAddressEditable(!isAddressEditable)
                                    }
                                >
                                    {isAddressEditable
                                        ? "Cancel Edit"
                                        : "Edit Address"}
                                </Button>
                            </div>

                            {!isAddressEditable ? (
                                <div className={styles.addressDisplay}>
                                    <p>
                                        {orderData.shippingAddress?.houseNumber}{" "}
                                        {orderData.shippingAddress?.street},
                                        {orderData.shippingAddress?.ward},{" "}
                                        {orderData.shippingAddress?.district},
                                        {
                                            orderData.shippingAddress
                                                ?.cityOrProvince
                                        }
                                    </p>
                                    <p>
                                        Phone:{" "}
                                        {orderData.shippingAddress?.phoneNumber}
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.addressForm}>
                                    <div className={styles.formRow}>
                                        <FormField
                                            control={form.control}
                                            name="houseNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        House Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="street"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Street
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className={styles.formRow}>
                                        <FormField
                                            control={form.control}
                                            name="ward"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ward</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="district"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        District
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className={styles.formRow}>
                                        <FormField
                                            control={form.control}
                                            name="cityOrProvince"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        City/Province
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Phone Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>
                                <AlertCircle size={16} /> Additional Notes
                            </h3>
                            <FormField
                                control={form.control}
                                name="customerNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Add any additional notes about this order"
                                                className={styles.notesTextarea}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className={styles.dialogFooter}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={form.handleSubmit(handleFormSubmit)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Updating..." : "Update Order"}
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
