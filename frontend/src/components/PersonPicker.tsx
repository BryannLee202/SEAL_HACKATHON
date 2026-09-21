import { useState } from "react";

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
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const isValidEmail = (value: string) => {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
};

    const handleAddPerson = () => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter an email.");
            return;
        }

        if (!isValidEmail(normalizedEmail)) {
            setError("Please enter a valid email.");
            return;
        }

        if (selectedPeople.includes(normalizedEmail)) {
            setError("This person has already been selected.");
            return;
        }

        if (selectedPeople.length >= maxPeople) {
            setError(
                `You can select at most ${maxPeople} members.`
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
                (selectedPerson) =>
                    selectedPerson !== person
            )
        );
    };

    return (
        <div className="person-picker">
            <div className="person-picker-input">
                <input
                    type="email"
                    placeholder="Nhập email thành viên"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
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
                    className="btn-primary"
                    onClick={handleAddPerson}
                    disabled={
                        selectedPeople.length >= maxPeople
                    }
                >
                    Add
                </button>
            </div>

            {error && (
                <p className="person-picker-error">
                    {error}
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
                                    {person
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <span>{person}</span>
                            </div>

                            <button
                                type="button"
                                className="person-remove-btn"
                                onClick={() =>
                                    handleRemovePerson(
                                        person
                                    )
                                }
                            >
                                Xoá
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="person-picker-empty">
                    Chưa chọn thành viên nào.
                </p>
            )}

            <p className="helper-text">
                {selectedPeople.length} / {maxPeople}{" "}
                members selected
            </p>
        </div>
    );
}

export default PersonPicker;