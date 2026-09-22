import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
    selectedPeople: string[];
    onChange: (people: string[]) => void;
    maxPeople?: number;
};

function PersonPicker({
    selectedPeople,
    onChange,
    maxPeople = 4,
}: Props) {
    const { language } = useLanguage();
    const isEn = language === "en";

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const isValidEmail = (value: string) => {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
    };

    const handleAddPerson = () => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError(isEn ? "Please enter an email address." : "Vui lòng nhập địa chỉ email.");
            return;
        }

        if (!isValidEmail(normalizedEmail)) {
            setError(isEn ? "Please enter a valid email address." : "Địa chỉ email không hợp lệ.");
            return;
        }

        if (selectedPeople.includes(normalizedEmail)) {
            setError(isEn ? "This person is already in the invite list." : "Email này đã có trong danh sách mời.");
            return;
        }

        if (selectedPeople.length >= maxPeople) {
            setError(
                isEn
                    ? `You can invite at most ${maxPeople} members.`
                    : `Chỉ có thể mời tối đa ${maxPeople} thành viên.`
            );
            return;
        }

        onChange([...selectedPeople, normalizedEmail]);
        setEmail("");
        setError("");
    };

    const handleRemovePerson = (person: string) => {
        onChange(
            selectedPeople.filter(
                (selectedPerson) => selectedPerson !== person
            )
        );
    };

    return (
        <div className="person-picker">
            <div className="person-picker-input">
                <input
                    type="email"
                    placeholder={isEn ? "Nhập email thành viên" : "Nhập email thành viên (vd: thanhvien@email.com)"}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddPerson();
                        }
                    }}
                />

                <button
                    type="button"
                    className="btn primary"
                    onClick={handleAddPerson}
                    disabled={selectedPeople.length >= maxPeople}
                >
                    {isEn ? "+ Add" : "+ Thêm"}
                </button>
            </div>

            {error && (
                <p className="person-picker-error">
                    ⚠️ {error}
                </p>
            )}

            {selectedPeople.length > 0 ? (
                <div className="person-picker-list">
                    {selectedPeople.map((person) => (
                        <div
                            className="person-picker-item"
                            key={person}
                        >
                            <div className="person-picker-user">
                                <div className="member-avatar">
                                    {person.charAt(0).toUpperCase()}
                                </div>
                                <span title={person}>{person}</span>
                            </div>

                            <button
                                type="button"
                                className="person-remove-btn"
                                onClick={() => handleRemovePerson(person)}
                                title={isEn ? "Remove" : "Xóa"}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="person-picker-empty">
                    {isEn ? "No members invited yet." : "Chưa có thành viên nào được mời."}
                </p>
            )}

            <p className="helper-text" style={{ textAlign: "right", marginTop: "8px" }}>
                {isEn
                    ? `${selectedPeople.length} / ${maxPeople} members selected`
                    : `Đã chọn ${selectedPeople.length} / ${maxPeople} thành viên`}
            </p>
        </div>
    );
}

export default PersonPicker;