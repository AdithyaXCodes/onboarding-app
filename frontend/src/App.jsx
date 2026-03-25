import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
 
const DEPARTMENTS = ["Engineering", "HR", "Marketing", "Sales", "Finance", "Design"];
const ROLES = ["Developer", "Designer", "Manager", "Intern", "Analyst", "Lead"];
const WORK_MODES = ["Remote", "Office", "Hybrid"];
 
const initialForm = {
  name: "", email: "", phone: "", department: "", role: "",
  work_mode: "", joining_date: "", city: "", state: "", zip: "", photo: null
};
 
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
 
function Avatar({ photo, name, size = 40 }) {
  const initials = name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const colors = ["#e74c8b", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", border: "2px solid #e2e8f0"
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: colors[colorIdx], display: "flex",
      alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 700,
      fontSize: size * 0.35, fontFamily: "'Sora', sans-serif",
      border: "2px solid rgba(255,255,255,0.3)"
    }}>
      {initials}
    </div>
  );
}
 
function Badge({ label }) {
  const map = {
    Remote: { bg: "#dbeafe", color: "#1d4ed8" },
    Office: { bg: "#d1fae5", color: "#065f46" },
    Hybrid: { bg: "#fef3c7", color: "#92400e" },
    Engineering: { bg: "#ede9fe", color: "#5b21b6" },
    HR: { bg: "#fce7f3", color: "#9d174d" },
    Marketing: { bg: "#ffedd5", color: "#9a3412" },
    Sales: { bg: "#dcfce7", color: "#166534" },
    Finance: { bg: "#cffafe", color: "#164e63" },
    Design: { bg: "#fae8ff", color: "#701a75" },
  };
  const style = map[label] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
      fontFamily: "'Sora', sans-serif", whiteSpace: "nowrap"
    }}>
      {label}
    </span>
  );
}
 
function Input({ label, icon, error, ...props }) {
  return (
    <div style={{ marginBottom: 4 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 11, fontWeight: 600,
          color: "#94a3b8", letterSpacing: 0.8, marginBottom: 4,
          textTransform: "uppercase", fontFamily: "'Sora', sans-serif"
        }}>{icon} {label}</label>
      )}
      <input
        {...props}
        style={{
          width: "100%", padding: "10px 12px",
          borderRadius: 10, border: error ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
          background: "#f8fafc", fontSize: 13, fontFamily: "'Sora', sans-serif",
          outline: "none", transition: "border 0.2s",
          boxSizing: "border-box", color: "#1e293b",
          ...props.style
        }}
        onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e => e.target.style.borderColor = error ? "#ef4444" : "#e2e8f0"}
      />
      {error && <span style={{ color: "#ef4444", fontSize: 11, fontFamily: "'Sora', sans-serif" }}>{error}</span>}
    </div>
  );
}
 
function Select({ label, icon, options, error, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 4 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 11, fontWeight: 600,
          color: "#94a3b8", letterSpacing: 0.8, marginBottom: 4,
          textTransform: "uppercase", fontFamily: "'Sora', sans-serif"
        }}>{icon} {label}</label>
      )}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: "10px 12px",
          borderRadius: 10, border: error ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
          background: "#f8fafc", fontSize: 13, fontFamily: "'Sora', sans-serif",
          outline: "none", color: value ? "#1e293b" : "#94a3b8",
          boxSizing: "border-box", cursor: "pointer", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center"
        }}
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <span style={{ color: "#ef4444", fontSize: 11, fontFamily: "'Sora', sans-serif" }}>{error}</span>}
    </div>
  );
}
 
// ============ ONBOARDING FORM ============
function OnboardingForm({ onSubmit, editingEmployee, onCancel }) {
  const [form, setForm] = useState(editingEmployee || initialForm);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(editingEmployee?.photo || null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef();
 
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
 
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target.result);
        set("photo", ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
 
  const validate = () => {
    const e = {};
    if (!form.name) e.name = "Required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone) e.phone = "Required";
    if (!form.department) e.department = "Required";
    if (!form.role) e.role = "Required";
    if (!form.work_mode) e.work_mode = "Required";
    if (!form.joining_date) e.joining_date = "Required";
    if (!form.city) e.city = "Required";
    if (!form.state) e.state = "Required";
    if (!form.zip) e.zip = "Required";
    if (!editingEmployee && !form.photo) e.photo = "Photo required";
    return e;
  };
 
  const handleSubmit = () => {
  const e = validate();
  if (Object.keys(e).length) { setErrors(e); return; }
  if (!confirmed && !editingEmployee) { setErrors({ confirm: "Please confirm" }); return; }

  onSubmit({ ...form, id: editingEmployee?.id || generateId() });

  setSubmitted(true);

  setTimeout(() => {
    setForm(initialForm);
    setPhotoPreview(null);
    setConfirmed(false);
    setSubmitted(false);

    if (editingEmployee) {
      onCancel?.();
    }
  }, 1500);
};
 
  if (submitted) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: 80, textAlign: "center"
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1e293b", marginBottom: 8 }}>
          {editingEmployee ? "Updated!" : "Welcome Aboard!"}
        </h2>
        <p style={{ color: "#64748b", fontFamily: "'Sora', sans-serif" }}>
          {form.name}'s profile has been {editingEmployee ? "updated" : "submitted"} successfully.
        </p>
      </div>
    );
  }
 
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 26,
          color: "#1e293b", margin: 0, marginBottom: 4
        }}>
          {editingEmployee ? "✏️ Edit Employee" : "🚀 New Employee Onboarding"}
        </h2>
        <p style={{ color: "#94a3b8", fontFamily: "'Sora', sans-serif", fontSize: 13, margin: 0 }}>
          {editingEmployee ? "Update the employee's information below." : "Fill in all details to onboard a new team member."}
        </p>
      </div>
 
      {/* Photo Upload */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        marginBottom: 24, padding: "16px 20px",
        background: "linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%)",
        borderRadius: 14, border: "1.5px dashed #c7d2fe"
      }}>
        <Avatar photo={photoPreview} name={form.name} size={64} />
        <div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, color: "#1e293b", marginBottom: 4 }}>
            Profile Photo
          </div>
          <button
            onClick={() => fileRef.current.click()}
            style={{
              padding: "6px 14px", borderRadius: 8,
              background: "#6366f1", color: "white",
              border: "none", cursor: "pointer",
              fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 600
            }}
          >
            {photoPreview ? "Change Photo" : "Upload Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
          {errors.photo && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4, fontFamily: "'Sora', sans-serif" }}>{errors.photo}</div>}
        </div>
      </div>
 
      {/* Section: Personal */}
      <SectionCard title="Personal Details" icon="👤">
        <Input label="Full Name" icon="" value={form.name} onChange={e => set("name", e.target.value)} error={errors.name} placeholder="e.g. Riya Sharma" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Email" value={form.email} onChange={e => set("email", e.target.value)} error={errors.email} placeholder="riya@company.com" type="email" />
          <Input label="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} error={errors.phone} placeholder="+91 98765 43210" />
        </div>
      </SectionCard>
 
      {/* Section: Address */}
      <SectionCard title="Address" icon="📍">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 12 }}>
          <Input label="City" value={form.city} onChange={e => set("city", e.target.value)} error={errors.city} placeholder="Bengaluru" />
          <Input label="State" value={form.state} onChange={e => set("state", e.target.value)} error={errors.state} placeholder="Karnataka" />
          <Input label="PIN" value={form.zip} onChange={e => set("zip", e.target.value)} error={errors.zip} placeholder="560001" />
        </div>
      </SectionCard>
 
      {/* Section: Job */}
      <SectionCard title="Job Details" icon="🏢">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select label="Department" options={DEPARTMENTS} value={form.department} onChange={e => set("department", e.target.value)} error={errors.department} />
          <Select label="Role" options={ROLES} value={form.role} onChange={e => set("role", e.target.value)} error={errors.role} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
          <Select label="Work Mode" options={WORK_MODES} value={form.work_mode} onChange={e => set("work_mode", e.target.value)} error={errors.work_mode} />
          <Input label="Joining Date" type="date" value={form.joining_date} onChange={e => set("joining_date", e.target.value)} error={errors.joining_date} />
        </div>
      </SectionCard>
 
      {!editingEmployee && (
        <label style={{
          display: "flex", alignItems: "center", gap: 10,
          marginTop: 16, cursor: "pointer",
          fontFamily: "'Sora', sans-serif", fontSize: 13, color: "#475569"
        }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#6366f1" }}
          />
          I confirm all the above information is accurate
          {errors.confirm && <span style={{ color: "#ef4444", fontSize: 11 }}>{errors.confirm}</span>}
        </label>
      )}
 
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {editingEmployee && (
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px 0", borderRadius: 12,
            background: "#f1f5f9", color: "#64748b",
            border: "none", cursor: "pointer",
            fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14
          }}>Cancel</button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!editingEmployee && !confirmed}
          style={{
            flex: 2, padding: "12px 0", borderRadius: 12,
            background: (!editingEmployee && !confirmed) ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: (!editingEmployee && !confirmed) ? "#94a3b8" : "white",
            border: "none", cursor: (!editingEmployee && !confirmed) ? "not-allowed" : "pointer",
            fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
            letterSpacing: 0.5, transition: "all 0.2s",
            boxShadow: (!editingEmployee && !confirmed) ? "none" : "0 4px 15px rgba(99,102,241,0.35)"
          }}
        >
          {editingEmployee ? "💾 Save Changes" : "🚀 Submit & Onboard"}
        </button>
      </div>
    </div>
  );
}
 
function SectionCard({ title, icon, children }) {
  return (
    <div style={{
      marginBottom: 16, padding: "18px 20px",
      background: "#fafafa", borderRadius: 14,
      border: "1.5px solid #e2e8f0"
    }}>
      <div style={{
        fontFamily: "'Sora', sans-serif", fontWeight: 700,
        fontSize: 12, color: "#6366f1", letterSpacing: 0.8,
        textTransform: "uppercase", marginBottom: 12
      }}>{icon} {title}</div>
      {children}
    </div>
  );
}
 
// ============ VIEW MODAL ============
function ViewModal({ employee, onClose, onEdit }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 56,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15,23,42,0.6)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
        backdropFilter: "blur(4px)",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          width: "100%",
          maxWidth: 520,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          marginTop: 56,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            padding: "16px 30px 12px",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: 30,
              height: 30,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
          <h3
            style={{
              color: "rgba(255,255,255,0.7)",
              fontFamily: "'Sora', sans-serif",
              fontSize: 11,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              margin: 0,
              marginBottom: 4,
            }}
          >
            Employee Profile
          </h3>
          <h2
            style={{
              color: "white",
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              margin: 0,
            }}
          >
            {employee.name}
          </h2>
        </div>

        <div style={{ padding: "0 24px 24px", marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                border: "3px solid white",
                borderRadius: "50%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <Avatar photo={employee.photo} name={employee.name} size={72} />
            </div>
            <div style={{ marginBottom: 4 }}>
              <Badge label={employee.department} />
              <div style={{ marginTop: 4 }}>
                <Badge label={employee.work_mode} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InfoTile label="Role" value={employee.role} icon="💼" />
            <InfoTile label="Joining Date" value={employee.joining_date} icon="📅" />
            <InfoTile label="Email" value={employee.email} icon="✉️" />
            <InfoTile label="Phone" value={employee.phone} icon="📱" />
            <InfoTile label="Location" value={`${employee.city}, ${employee.state}`} icon="📍" span />
          </div>
        </div>

        <div
          style={{
            padding: "14px 24px",
            background: "#f8fafc",
            display: "flex",
            gap: 10,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={() => {
              onEdit(employee);
              onClose();
            }}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              background: "white",
              color: "#64748b",
              border: "1.5px solid #e2e8f0",
              cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
 
function InfoTile({ label, value, icon, span }) {
  return (
    <div style={{
      background: "#f8fafc", borderRadius: 10, padding: "10px 14px",
      gridColumn: span ? "1 / -1" : undefined
    }}>
      <div style={{
        fontFamily: "'Sora', sans-serif", fontSize: 10,
        color: "#94a3b8", letterSpacing: 0.8, textTransform: "uppercase",
        fontWeight: 600, marginBottom: 2
      }}>{icon} {label}</div>
      <div style={{
        fontFamily: "'Sora', sans-serif", fontSize: 13,
        color: "#1e293b", fontWeight: 600
      }}>{value}</div>
    </div>
  );
}
 
// ============ CONFIRM DIALOG ============
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "white", borderRadius: 16, padding: 28,
        maxWidth: 340, width: "90%", textAlign: "center",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1e293b", margin: "0 0 8px" }}>Delete Employee?</h3>
        <p style={{ fontFamily: "'Sora', sans-serif", color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px 0", borderRadius: 10,
            background: "#f1f5f9", color: "#64748b",
            border: "none", cursor: "pointer",
            fontFamily: "'Sora', sans-serif", fontWeight: 600
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px 0", borderRadius: 10,
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white", border: "none", cursor: "pointer",
            fontFamily: "'Sora', sans-serif", fontWeight: 600
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
 
// ============ ADMIN DASHBOARD ============
function AdminDashboard({ employees, onDelete, onEdit, onView }) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
 
  const filtered = employees.filter(e => {
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      String(e.id).includes(search);
    const matchDept = !deptFilter || e.department === deptFilter;
    const matchMode = !modeFilter || e.work_mode === modeFilter;
    return matchSearch && matchDept && matchMode;
  });
 
  const stats = {
    total: employees.length,
    remote: employees.filter(e => e.work_mode === "Remote").length,
    office: employees.filter(e => e.work_mode === "Office").length,
    hybrid: employees.filter(e => e.work_mode === "Hybrid").length,
  };
 
  return (
    <div>
      {deleteTarget && (
        <ConfirmDialog
          message={`This will permanently remove ${deleteTarget.name} from the system.`}
          onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
 
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 26,
          color: "#1e293b", margin: 0, marginBottom: 4
        }}>🏢 Admin Dashboard</h2>
        <p style={{ color: "#94a3b8", fontFamily: "'Sora', sans-serif", fontSize: 13, margin: 0 }}>
          Manage all onboarded employees
        </p>
      </div>
 
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total", value: stats.total, color: "#6366f1", bg: "#ede9fe" },
          { label: "Remote", value: stats.remote, color: "#3b82f6", bg: "#dbeafe" },
          { label: "Office", value: stats.office, color: "#10b981", bg: "#d1fae5" },
          { label: "Hybrid", value: stats.hybrid, color: "#f59e0b", bg: "#fef3c7" },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 12, padding: "14px 16px",
            border: `1px solid ${s.color}22`
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: 26,
              fontWeight: 700, color: s.color, lineHeight: 1
            }}>{s.value}</div>
            <div style={{
              fontFamily: "'Sora', sans-serif", fontSize: 11,
              color: s.color, fontWeight: 600, marginTop: 2,
              textTransform: "uppercase", letterSpacing: 0.8
            }}>{s.label}</div>
          </div>
        ))}
      </div>
 
      {/* Filters */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 16,
        flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
          <span style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 14, color: "#94a3b8"
          }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, ID..."
            style={{
              width: "100%", padding: "9px 12px 9px 32px",
              borderRadius: 10, border: "1.5px solid #e2e8f0",
              background: "white", fontFamily: "'Sora', sans-serif",
              fontSize: 13, outline: "none", boxSizing: "border-box", color: "#1e293b"
            }}
          />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{
          padding: "9px 32px 9px 12px", borderRadius: 10,
          border: "1.5px solid #e2e8f0", background: "white",
          fontFamily: "'Sora', sans-serif", fontSize: 13, color: deptFilter ? "#1e293b" : "#94a3b8",
          outline: "none", cursor: "pointer", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center"
        }}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} style={{
          padding: "9px 32px 9px 12px", borderRadius: 10,
          border: "1.5px solid #e2e8f0", background: "white",
          fontFamily: "'Sora', sans-serif", fontSize: 13, color: modeFilter ? "#1e293b" : "#94a3b8",
          outline: "none", cursor: "pointer", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center"
        }}>
          <option value="">All Work Modes</option>
          {WORK_MODES.map(m => <option key={m}>{m}</option>)}
        </select>
        {(search || deptFilter || modeFilter) && (
          <button onClick={() => { setSearch(""); setDeptFilter(""); setModeFilter(""); }} style={{
            padding: "9px 14px", borderRadius: 10, background: "#fef2f2",
            color: "#ef4444", border: "1.5px solid #fecaca",
            fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}>✕ Clear</button>
        )}
      </div>
 
      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "50px 20px",
          background: "#f8fafc", borderRadius: 14,
          border: "1.5px dashed #e2e8f0"
        }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔎</div>
          <p style={{ fontFamily: "'Sora', sans-serif", color: "#94a3b8", fontSize: 14 }}>
            No employees found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "separate",
            borderSpacing: "0 6px"
          }}>
            <thead>
              <tr>
                {["ID", "Employee", "Contact", "Department", "Role", "Work Mode", "Joined", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left",
                    fontFamily: "'Sora', sans-serif", fontSize: 10,
                    fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
                    letterSpacing: 0.8, background: "transparent"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr key={emp.id} style={{ animation: `fadeIn 0.3s ease ${i * 0.04}s both` }}>
                  {[
                    <td key="id" style={tdStyle}><span style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>#{emp.id.toString().slice(-4)}</span></td>,
                    <td key="emp" style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar photo={emp.photo} name={emp.name} size={36} />
                        <div>
                          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{emp.name}</div>
                          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, color: "#94a3b8" }}>{emp.city}, {emp.state}</div>
                        </div>
                      </div>
                    </td>,
                    <td key="contact" style={tdStyle}>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, color: "#475569" }}>{emp.email}</div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, color: "#94a3b8" }}>{emp.phone}</div>
                    </td>,
                    <td key="dept" style={tdStyle}><Badge label={emp.department} /></td>,
                    <td key="role" style={tdStyle}><span style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, color: "#475569" }}>{emp.role}</span></td>,
                    <td key="mode" style={tdStyle}><Badge label={emp.work_mode} /></td>,
                    <td key="date" style={tdStyle}><span style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, color: "#475569" }}>{emp.joining_date}</span></td>,
                    <td key="actions" style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn onClick={() => onView(emp)} title="View" color="#6366f1" bg="#ede9fe">👁</ActionBtn>
                        <ActionBtn onClick={() => onEdit(emp)} title="Edit" color="#3b82f6" bg="#dbeafe">✏️</ActionBtn>
                        <ActionBtn onClick={() => setDeleteTarget(emp)} title="Delete" color="#ef4444" bg="#fee2e2">🗑</ActionBtn>
                      </div>
                    </td>
                  ]}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
 
const tdStyle = {
  padding: "12px 12px",
  background: "white",
  verticalAlign: "middle",
  borderBottom: "1px solid #f1f5f9"
};
 
function ActionBtn({ onClick, title, color, bg, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: bg, color, border: "none",
        cursor: "pointer", fontSize: 13,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "transform 0.1s"
      }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {children}
    </button>
  );
}
 
// ============ ROOT APP ============
const DEMO_DATA = [
  { id: 1001, name: "Priya Sharma", email: "priya@company.com", phone: "+91 98765 43210", department: "Engineering", role: "Developer", work_mode: "Hybrid", joining_date: "2024-01-15", city: "Bengaluru", state: "Karnataka", zip: "560001", photo: null },
  { id: 1002, name: "Arjun Mehta", email: "arjun@company.com", phone: "+91 87654 32109", department: "Marketing", role: "Manager", work_mode: "Office", joining_date: "2024-02-01", city: "Mumbai", state: "Maharashtra", zip: "400001", photo: null },
  { id: 1003, name: "Sneha Iyer", email: "sneha@company.com", phone: "+91 76543 21098", department: "Design", role: "Designer", work_mode: "Remote", joining_date: "2024-03-10", city: "Chennai", state: "Tamil Nadu", zip: "600001", photo: null },
];
 
// Simulated user role (replace with real auth/role logic as needed)
const userRole = "admin"; // or "user"

function AppContent() {
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch("http://127.0.0.1:5003/api/users")
      .then(res => res.json())
      .then(data => setEmployees(data.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (data) => {
    if (editingEmployee) {
      await fetch(`http://127.0.0.1:5003/api/users/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } else {
      await fetch("http://127.0.0.1:5003/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }

    const res = await fetch("http://127.0.0.1:5003/api/users");
    const updated = await res.json();
    setEmployees(updated.data);
    setEditingEmployee(null);
    // After submit, redirect to admin dashboard if not editing
    if (!editingEmployee) {
      navigate("/admin");
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    navigate("/");
  };

  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:5003/api/users/${id}`, {
      method: "DELETE"
    });
    const res = await fetch("http://127.0.0.1:5003/api/users");
    const updated = await res.json();
    setEmployees(updated.data);
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    navigate("/admin");
  };

  // Top bar always visible
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Sora:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 50%, #fff0f6 100%)"
      }}>
        {/* Top Nav */}
        <div style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 20px",
          display: "flex", alignItems: "center",
          height: 56, gap: 0,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18, fontWeight: 700,
            color: "#1e293b", marginRight: 32,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: 8, padding: "4px 8px",
              color: "white", fontSize: 14
            }}>HR</span>
            OnboardIQ
          </div>
          {/* Top nav links */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            height: "100%",
          }}>
            <NavLinkButton
              to="/"
              label="Onboarding Form"
              active={location.pathname === "/"}
            />
            {userRole === "admin" && (
              <NavLinkButton
                to="/admin"
                label="Admin Dashboard"
                active={location.pathname === "/admin"}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            width: "100%",
            padding: "24px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: location.pathname === "/" ? 780 : "100%",
              padding: "0 16px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: 28,
                boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
                border: "1px solid #e2e8f0",
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <OnboardingForm
                      onSubmit={handleSubmit}
                      editingEmployee={editingEmployee}
                      onCancel={handleCancelEdit}
                    />
                  }
                />
                <Route
                  path="/admin"
                  element={
                    userRole === "admin" ? (
                      <AdminDashboard
                        employees={employees}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onView={setViewingEmployee}
                      />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                {/* catch-all: redirect unknown routes to "/" */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>

      {viewingEmployee && (
        <ViewModal
          employee={viewingEmployee}
          onClose={() => setViewingEmployee(null)}
          onEdit={handleEdit}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
// NavLinkButton for top navigation
import { useCallback } from "react";
function NavLinkButton({ to, label, active }) {
  const navigate = useNavigate();
  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      if (!active) navigate(to);
    },
    [navigate, to, active]
  );
  return (
    <a
      href={to}
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 36,
        padding: "0 18px",
        marginRight: 8,
        fontFamily: "'Sora', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: active ? "#6366f1" : "#64748b",
        background: active
          ? "linear-gradient(90deg, #f3f4f6 60%, #ede9fe 100%)"
          : "transparent",
        border: "none",
        borderRadius: 8,
        textDecoration: active ? "underline" : "none",
        textUnderlineOffset: 3,
        cursor: active ? "default" : "pointer",
        transition: "color 0.15s, background 0.15s",
        boxShadow: active ? "0 2px 8px rgba(99,102,241,0.06)" : "none",
        borderBottom: active ? "2.5px solid #6366f1" : "2.5px solid transparent"
      }}
      aria-current={active ? "page" : undefined}
      tabIndex={0}
    >
      {label}
    </a>
  );
}