import React, { useEffect, useState } from "react";
import axios from "axios";

const AIRTABLE_ACCESS_TOKEN = "patApLQSMYaIS4WIL.2ff916afd92f4d4d568b2692f81c60780da191fcb899935985d18a54e3287c07";
const BASE_ID = "appBl9LubM8rQ0LS8";
const SCORES_TABLE = "Scores";
const PLAYERS_TABLE = "Players";

const Leaderboard = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState("desc"); // Default: Descending (Highest to Lowest)

    useEffect(() => {
        const fetchScores = async () => {
            try {
                console.log("🔄 Fetching leaderboard data...");

                // Fetch scores from Airtable
                const scoresResponse = await axios.get(
                    `https://api.airtable.com/v0/${BASE_ID}/${SCORES_TABLE}`,
                    { headers: { Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}` } }
                );

                console.log("✅ Scores API Response:", scoresResponse.data.records);

                // Fetch players from Airtable
                const playersResponse = await axios.get(
                    `https://api.airtable.com/v0/${BASE_ID}/${PLAYERS_TABLE}`,
                    { headers: { Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}` } }
                );

                console.log("✅ Players API Response:", playersResponse.data.records);

                // Convert players to a dictionary {recordID: playerName}
                const playersDict = {};
                playersResponse.data.records.forEach(player => {
                    playersDict[player.id] = player.fields["Name"];
                });

                // Merge scores by player
                const mergedScores = {};
                scoresResponse.data.records.forEach(score => {
                    const playerID = Array.isArray(score.fields["Player ID"]) && score.fields["Player ID"].length > 0
                        ? score.fields["Player ID"][0]
                        : null;

                    const playerName = playerID ? (playersDict[playerID] || "Unknown Player").trim() : "Unknown Player";
                    const points = score.fields["Total Points"] || 0;

                    if (mergedScores[playerName]) {
                        mergedScores[playerName] += points;
                    } else {
                        mergedScores[playerName] = points;
                    }
                });

                // Convert to array and sort by points
                const sortedScores = Object.entries(mergedScores)
                    .map(([playerName, totalPoints]) => ({ playerName, points: totalPoints }))
                    .sort((a, b) => (sortOrder === "desc" ? b.points - a.points : a.points - b.points));

                setScores(sortedScores);
                setLoading(false);
            } catch (error) {
                console.error("❌ Error fetching leaderboard:", error);
                setLoading(false);
            }
        };

        fetchScores();
        const interval = setInterval(fetchScores, 30000);
        return () => clearInterval(interval);
    }, [sortOrder]); // Re-run when sorting changes

    // Toggle sorting order
    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    };

    return (
        <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ color: "#d32f2f", fontSize: "2em" }}>🏎️ F1 Fantasy Leaderboard</h2>

            <button 
                onClick={toggleSortOrder} 
                style={{ marginBottom: "10px", padding: "8px", fontSize: "1em", cursor: "pointer" }}
            >
                {sortOrder === "desc" ? "Sort: 🔼 Low to High" : "Sort: 🔽 High to Low"}
            </button>

            {loading ? (
                <p style={{ fontSize: "1.2em", color: "#555" }}>Loading leaderboard...</p>
            ) : (
                <table style={{
                    width: "80%",
                    margin: "20px auto",
                    borderCollapse: "collapse",
                    border: "2px solid #d32f2f",
                    fontSize: "1.2em"
                }}>
                    <thead>
                        <tr style={{ backgroundColor: "#d32f2f", color: "white" }}>
                            <th style={tableHeaderStyle}>Rank</th>
                            <th style={tableHeaderStyle}>Player</th>
                            <th style={tableHeaderStyle}>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((entry, index) => (
                            <tr key={entry.playerName} style={index === 0 ? topPlayerStyle : rowStyle}>
                                <td style={cellStyle}>{index + 1}</td>
                                <td style={cellStyle}>{entry.playerName}</td>
                                <td style={cellStyle}>{entry.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

// CSS Styles
const tableHeaderStyle = {
    padding: "10px",
    textAlign: "center",
    fontWeight: "bold"
};

const cellStyle = {
    padding: "10px",
    textAlign: "center",
    borderBottom: "1px solid #ccc"
};

const rowStyle = {
    backgroundColor: "#f9f9f9"
};

const topPlayerStyle = {
    backgroundColor: "#ffeb3b",
    fontWeight: "bold"
};

export default Leaderboard;