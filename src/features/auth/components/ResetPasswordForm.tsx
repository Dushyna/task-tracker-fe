import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {fetchResetPassword, fetchValidateResetToken} from "../services/api";

const ResetPasswordForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Reset token is missing");
            setLoading(false);
            return;
        }

        const validate = async () => {
            try {
                await fetchValidateResetToken(token);
                setLoading(false);
            } catch {
                setError("Reset link is invalid or expired");
                setLoading(false);
            }
        };

        validate();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await fetchResetPassword({ token: token!, newPassword });
            setSuccess(true);

            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch {
            setError("Failed to reset password");
        }
    };

    if (loading) {
        return <p className="text-center mt-10">Checking reset link...</p>;
    }

    if (error) {
        return <p className="text-center mt-10 text-red-500">{error}</p>;
    }

    if (success) {
        return (
            <p className="text-center mt-10 text-green-600 font-semibold">
                ✅ Your password has been successfully updated!
            </p>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-semibold mb-4 text-center">
                Reset password
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full border px-3 py-2 rounded"
                />

                <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded"
                >
                    Reset password
                </button>
            </form>
        </div>
    );
};
export default ResetPasswordForm;