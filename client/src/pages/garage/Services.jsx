
import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

export default function GarageServices() {
  const { services } = useSelector(state => state.garage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted">Manage your service offerings</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="btn-primary w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-soft p-4 sm:p-6"
          >
            <div className="flex items-start justify-between mb-4 gap-3">
              <h3 className="text-lg sm:text-xl font-bold break-all">{service.name}</h3>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setEditingService(service);
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded-lg hover:bg-bg-soft"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-bg-soft text-red-500">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-muted text-xs sm:text-sm mb-4 break-words">{service.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className="text-muted">Price Range</span>
                <span className="font-semibold">₹{service.startingPrice} - ₹{service.maximumPrice}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className="text-muted">Est. Time</span>
                <span className="font-semibold">{service.estimatedTime}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className="text-muted">Category</span>
                <span className="font-semibold">{service.category}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
