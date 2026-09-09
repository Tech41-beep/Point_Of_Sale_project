import api from "../../api";
import {useState, useEffect} from "react";
import { toast } from "react-toastify";
import Modal from "../../components/Modal";

const SalePaymentModal = ({open, editId, onClose, onPaymentAdded}) => {
    const [isLoading, setIsLoading] = useState(false);

    const [paidAmount, setPaidAmount] = useState("");

    useEffect(() => {
      if (!open) setPaidAmount("");
    }, [open]);

    const addPayment = async(id , data) => {
        try{
            setIsLoading(true);
            const response = await api.post(`/sales/payment/${id}`, data);
            toast.success(response.data.message || "Payment added successfully");
            onPaymentAdded?.(response.data?.result);
            onClose?.();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add payment");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async(event) => {
      event.preventDefault();
      const amount = Number(paidAmount);

      if (!editId || amount <= 0) {
        toast.error("Paid amount must be greater than zero");
        return;
      }

      await addPayment(editId, {paidAmount: amount});
    };

  return (
    <Modal open={open} title="Add payment" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700">
          Paid amount
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={paidAmount}
            onChange={(event) => setPaidAmount(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500"
            placeholder="Enter payment amount"
            required
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SalePaymentModal;
