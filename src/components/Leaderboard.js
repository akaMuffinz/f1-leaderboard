import React, { useEffect, useState } from "react";
import axios from "axios";

const AIRTABLE_ACCESS_TOKEN = "patApLQSMYaIS4WIL.2ff916afd92f4d4d568b2692f81c60780da191fcb899935985d18a54e3287c07";
const BASE_ID = "appBl9LubM8rQ0LS8";
const SCORES_TABLE = "Scores";
const PLAYERS_TABLE = "Players";

const Leaderboard = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    console.log("🔹 Player Record:", player);
                    playersDict[player.id] = player.fields["Name"];
                });

                console.log("✅ Players Dictionary:", playersDict);

                // Merge scores by player
                const mergedScores = {};

                scoresResponse.data.records.forEach(score => {
                    console.log("🔹 Score Record:", score.fields);

                    // Ensure "Player ID" exists
                    const playerID = Array.isArray(score.fields["Player ID"]) && score.fields["Player ID"].length > 0
                        ? score.fields["Player ID"][0]
                        : null;

                    const playerName = playerID ? (playersDict[playerID] || "Unknown Player").trim().toLowerCase() : "Unknown Player";
                    const points = score.fields["Total Points"] || 0;

                    // Merge scores by player name
                    if (mergedScores[playerName]) {
                        mergedScores[playerName] += points;
                    } else {
                        mergedScores[playerName] = points;
                    }
                });

                // Convert merged object into a sorted array
                const sortedScoresArray = Object.entries(mergedScores)
                    .map(([playerName, totalPoints]) => ({ playerName, points: totalPoints }))
                    .sort((a, b) => b.points - a.points);

                console.log("✅ Merged and Sorted Scores:", sortedScoresArray);

                setScores(sortedScoresArray);
                setLoading(false);
            } catch (error) {
                console.error("❌ Error fetching leaderboard:", error);
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    return (
        <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ color: "#d32f2f", fontSize: "2em" }}>🏎️ F1 Fantasy Leaderboard</h2>

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

// ✅ Make sure this is the LAST LINE in the file:
export default Leaderboard;
