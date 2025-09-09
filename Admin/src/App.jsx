import React, { useState, useEffect } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null); // track if editing
  const [project, setProject] = useState({
    name: "",
    location: "",
    description: "",
    category: "",
    image: "",
    plantSpecies: "",
  });

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async () => {
  const res = await fetch("http://localhost:5001/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to store the cookie
    body: JSON.stringify({ password }),
  });

  const data = await res.json();
  if (data.success) {
    alert("Login successful!");
  } else {
    alert("Login failed");
  }
};


  /* ---------------- FETCH PROJECTS ---------------- */
  const fetchProjects = async () => {
  try {
    const res = await fetch("http://localhost:5001/api/projects", {
      credentials: "include", // send the cookie automatically
    });
    const data = await res.json();
    if (data.success) setProjects(data.data);
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
};


  useEffect(() => {
  const checkAuth = async () => {
    const res = await fetch("http://localhost:5001/api/check-auth", {
      credentials: "include"
    });
    const data = await res.json();
    if (data.loggedIn) {
      fetchProjects();
    } else {
      setToken(""); // forces login page
    }
  };
  checkAuth();
}, []);


  /* ---------------- ADD / UPDATE PROJECT ---------------- */
  const saveProject = async () => {
  const payload = {
    ...project,
    plantSpecies: project.plantSpecies
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };

  const url = editingId
    ? `http://localhost:5001/api/projects/${editingId}`
    : "http://localhost:5001/api/projects";
  const method = editingId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      alert(editingId ? "✅ Project updated!" : "✅ Project added!");
      setProject({
        name: "",
        location: "",
        description: "",
        category: "",
        image: "",
        plantSpecies: "",
      });
      setEditingId(null);
      fetchProjects();
    } else {
      alert(data.error || "❌ Error saving project");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Failed to save project");
  }
};


  /* ---------------- START EDITING ---------------- */
  const editProject = (proj) => {
    setProject({
      name: proj.name,
      location: proj.location,
      description: proj.description,
      category: proj.category,
      image: proj.image,
      plantSpecies: proj.plantSpecies.join(", "),
    });
    setEditingId(proj._id);
  };

  const handleLogout = async () => {
  await fetch("http://localhost:5001/api/logout", {
    method: "POST",
    credentials: "include"
  });
  setToken(""); // hide admin panel
  alert("Logged out successfully");
};


  /* ---------------- LOGIN PAGE ---------------- */
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Admin Login
          </h2>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- ADMIN PANEL ---------------- */
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {editingId ? "✏️ Edit Project" : "➕ Add Project"}
        </h2>

        {/* Form */}
        {["name", "location", "category", "image"].map((field) => (
          <div key={field}>
            <label className="block mb-2 font-medium text-gray-700 capitalize">
              {field}
            </label>
            <input
              type="text"
              value={project[field]}
              onChange={(e) =>
                setProject({ ...project, [field]: e.target.value })
              }
              className="w-full mb-4 px-4 py-2 border rounded-lg"
            />
          </div>
        ))}

        <label className="block mb-2 font-medium text-gray-700">Description</label>
        <textarea
          value={project.description}
          onChange={(e) =>
            setProject({ ...project, description: e.target.value })
          }
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          rows="3"
        />

        <label className="block mb-2 font-medium text-gray-700">
          Plant Species (comma-separated)
        </label>
        <textarea
          value={project.plantSpecies}
          onChange={(e) =>
            setProject({ ...project, plantSpecies: e.target.value })
          }
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          rows="3"
        />

        <button
          onClick={saveProject}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          {editingId ? "Update Project" : "Add Project"}
        </button>
      </div>

      <button
  onClick={handleLogout}
  className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
>
  Logout
</button>


      {/* Project List */}
      <div className="mt-8 w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">📂 Projects</h3>
        {projects.length === 0 ? (
          <p className="text-gray-600">No projects found.</p>
        ) : (
          <ul className="space-y-3">
            {projects.map((p) => (
              <li
                key={p._id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.location}</p>
                </div>
                <button
                  onClick={() => editProject(p)}
                  className="px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
