import React, {useState} from 'react';
import {fetchForgotPassword} from "../features/auth/services/api.ts";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await fetchForgotPassword(email);
            setMessage(
                "If a user with that email exists, a password reset link has been sent."
            );
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-semibold mb-4 text-center">
                Forgot password
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full border px-3 py-2 rounded"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded"
                >
                    {loading ? "Sending..." : "Send reset link"}
                </button>
            </form>

            {message && (
                <p className="mt-4 text-green-600 text-center">{message}</p>
            )}
            {error && (
                <p className="mt-4 text-red-500 text-center">{error}</p>
            )}
        </div>
    );
};
export default ForgotPassword;