
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiPlus, FiTrendingUp, FiArrowDown, FiArrowUp } from "react-icons/fi";
import { setWallet } from "@/store/garageSlice";
import { mockTransactions } from "@/data/garageData";

export default function GarageWallet() {
  const { wallet } = useSelector(state => state.garage);
  const dispatch = useDispatch();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  useEffect(() => {
    dispatch(setWallet({ ...wallet, transactions: mockTransactions }));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted">Manage your wallet and transactions</p>
      </div>

      <div className="card-soft p-8 text-center bg-gradient-to-br from-brand-soft to-white">
        <p className="text-muted mb-2">Available Balance</p>
        <h2 className="text-5xl font-bold mb-6">₹{wallet.balance.toLocaleString()}</h2>
        <button
          onClick={() => setShowRechargeModal(true)}
          className="btn-primary"
        >
          <FiPlus className="w-4 h-4" />
          Recharge Wallet
        </button>
      </div>

      <div className="card-soft p-6">
        <h3 className="text-xl font-bold mb-4">Transaction History</h3>
        <div className="space-y-3">
          {wallet.transactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between p-4 bg-bg-soft rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  txn.amount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {txn.amount > 0 ? <FiArrowDown /> : <FiArrowUp />}
                </div>
                <div>
                  <p className="font-semibold">{txn.description}</p>
                  <p className="text-muted text-sm">{new Date(txn.date).toLocaleDateString()}</p>
                </div>
              </div>
              <p className={`font-bold ${txn.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                {txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
