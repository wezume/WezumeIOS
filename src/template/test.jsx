import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
    StatusBar,
    SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Icon from "react-native-vector-icons/Feather";
import apiClient from './api';

const metricsConfig = {
    Clarity: [
        { level: "Low", min: 0, max: 50, comments: ["Your message is hard to follow", "Ideas are not clearly connected", "Key points lack clarity", "Your pitch lacks flow"], impact: "Improving this enhances delivery impact", fix: "Plan your structure with a clear beginning, middle, and end" },
        { level: "Medium", min: 51, max: 65, comments: ["Structure is decent but can improve", "Some points are clear", "Communication is reasonable", "Clarity is inconsistent"], impact: "Improving this enhances delivery impact", fix: "Use transitions like 'First', 'Next', and 'Finally' to link ideas" },
        { level: "High", min: 66, max: 100, comments: ["Well structured and easy to follow", "Ideas are clearly presented", "Strong concise communication", "Excellent clarity"], impact: "Improving this enhances delivery impact", fix: "Maintain this level of logical structure in more complex answers" },
    ],
    Confidence: [
        { level: "Low", min: 0, max: 50, comments: ["Delivery feels hesitant", "Posture reduces impact", "You seem unsure", "Confidence needs improvement"], impact: "Improving this enhances delivery impact", fix: "Keep a steady volume and avoid trailing off at the end of sentences" },
        { level: "Medium", min: 51, max: 65, comments: ["Confidence is moderate", "Shows confidence in parts", "Stable but improvable", "Decent overall"], impact: "Improving this enhances delivery impact", fix: "Practice speaking with more authority by reducing self-correcting statements" },
        { level: "High", min: 66, max: 100, comments: ["Strong presence on camera", "Delivery feels assured", "Engaging delivery", "Excellent presence"], impact: "Improving this enhances delivery impact", fix: "Leverage your natural confidence to take on lead roles in discussions" },
    ],
    Authenticity: [
        { level: "Low", min: 0, max: 50, comments: ["Less natural than most candidates", "Lacks personal connect", "Feels rehearsed", "Limited genuineness"], impact: "Improving this enhances delivery impact", fix: "Try to share personal anecdotes to make your delivery feel more natural" },
        { level: "Medium", min: 51, max: 65, comments: ["Somewhat natural delivery", "Partially authentic", "Moderate personal connect", "Needs more authenticity"], impact: "Improving this enhances delivery impact", fix: "Focus on maintaining a more conversational tone throughout your talk" },
        { level: "High", min: 66, max: 100, comments: ["Natural and real delivery", "Strong personal connect", "Highly authentic", "Sincere communication"], impact: "Improving this enhances delivery impact", fix: "Keep up the sincere storytelling and personal connection in all answers" },
    ],
    EQ: [
        { level: "Low", min: 0, max: 50, comments: ["Self-focused pitch", "Low emotional awareness", "No collaboration examples", "Low people-connect"], impact: "Improving this enhances delivery impact", fix: "Incorporate more vocal warmth and empathetic signals into your delivery" },
        { level: "Medium", min: 51, max: 65, comments: ["Some team awareness", "Mentions collaboration", "Moderate EQ", "Needs more people impact"], impact: "Improving this enhances delivery impact", fix: "Use occasional warm smiles and conversational nodding to build rapport" },
        { level: "High", min: 66, max: 100, comments: ["Strong team awareness", "Clear collaboration", "High emotional intelligence", "Strong people-connect"], impact: "Improving this enhances delivery impact", fix: "Maintain your strong empathic presence as it builds excellent trust" },
    ],
    "Speech Rate": [
        { level: "Low", min: 0, max: 50, comments: ["You are speaking too slowly", "Your delivery feels stretched", "Speech pace reduces engagement", "You may lose listener attention", "Consider a slightly faster pace"], impact: "Improving this enhances delivery impact", fix: "Try to increase your speaking pace slightly to keep listeners engaged" },
        { level: "Medium", min: 51, max: 65, comments: ["Your speaking pace is balanced", "Your speed is comfortable to follow", "Speech rate is moderate", "Mostly well-paced delivery", "Pace is acceptable but can improve"], impact: "Improving this enhances delivery impact", fix: "Maintain this balanced pace as it allows for natural rhythmic variations" },
        { level: "High", min: 66, max: 100, comments: ["You are speaking too fast", "Your delivery feels rushed", "Important points may be missed", "Speech speed reduces clarity", "Slow down slightly for better impact"], impact: "Improving this enhances delivery impact", fix: "Deliberately slow down between key points to let information sink in" },
    ],
    "Filler Words": [
        { level: "Low", min: 0, max: 50, comments: ["Too many filler words used", "Filler words reduce clarity", "Frequent pauses affect flow", "Speech feels unpolished", "Needs significant improvement"], impact: "Improving this enhances delivery impact", fix: "Focus on reducing 'uhs' by preparing your key points more naturally before speaking" },
        { level: "Medium", min: 51, max: 65, comments: ["Some filler words are present", "Occasional 'um' or 'uh' detected", "Moderate speech interruptions", "Can be reduced for better clarity", "Slight distractions in speech"], impact: "Improving this enhances delivery impact", fix: "Use a short, deliberate pause when you are thinking instead of using 'um' or 'uh'" },
        { level: "High", min: 66, max: 100, comments: ["Minimal filler words used", "Clean and fluent delivery", "You speak without distractions", "Very few unnecessary words", "Strong verbal clarity"], impact: "Improving this enhances delivery impact", fix: "Your verbal clarity is strong; continue practicing to maintain this focus" },
    ],
    "Eye Contact": [
        { level: "Low", min: 0, max: 50, comments: ["You rarely maintain eye contact", "Frequent gaze away from camera", "Reduces confidence perception", "Looks disengaged", "Needs strong improvement"], impact: "Improving this enhances delivery impact", fix: "Focus on the camera lens consistently to establish better audience connection" },
        { level: "Medium", min: 51, max: 65, comments: ["Eye contact is moderate", "You maintain focus intermittently", "Some distractions in gaze", "Can be more consistent", "Acceptable but not strong"], impact: "Improving this enhances delivery impact", fix: "Try to maintain steady eye contact for 3-5 seconds at a time while talking" },
        { level: "High", min: 66, max: 100, comments: ["Strong eye contact maintained", "You appear engaged and confident", "Consistent camera focus", "Builds trust and presence", "Excellent visual connection"], impact: "Improving this enhances delivery impact", fix: "Excellent visual engagement; keep this level of focus to build trust" },
    ],
    "Smile": [
        { level: "Low", min: 0, max: 50, comments: ["Limited or no smile detected", "You appear serious throughout", "Reduces warmth", "Less engaging expression", "Needs more facial warmth"], impact: "Improving this enhances delivery impact", fix: "Start and end each key point with a natural, friendly smile" },
        { level: "Medium", min: 51, max: 65, comments: ["Occasional smile observed", "Some warmth in expression", "Moderate engagement", "Can be more expressive", "Smile is present but limited"], impact: "Improving this enhances delivery impact", fix: "Use occasional smiles to highlight positive points in your story" },
        { level: "High", min: 66, max: 100, comments: ["Good smile throughout", "You appear warm and approachable", "Positive facial expression", "Highly engaging presence", "Strong emotional connect"], impact: "Improving this enhances delivery impact", fix: "Keep up the approachable presence and warm facial expressions" },
    ],
    "Energy": [
        { level: "Low", min: 0, max: 50, comments: ["Low energy delivery", "You sound flat or dull", "Engagement is low", "Needs more enthusiasm", "Delivery lacks impact"], impact: "Improving this enhances delivery impact", fix: "Vary your volume slightly to convey more passion and excitement" },
        { level: "Medium", min: 51, max: 65, comments: ["Moderate energy level", "Some engagement in delivery", "Energy varies across pitch", "Can be more dynamic", "Balanced but not strong"], impact: "Improving this enhances delivery impact", fix: "Incorporate more vocal highlights when discussing significant results" },
        { level: "High", min: 66, max: 100, comments: ["High energy and engaging", "You sound enthusiastic", "Strong presence and impact", "Very engaging delivery", "Excellent energy levels"], impact: "Improving this enhances delivery impact", fix: "Keep up this dynamic and high-impact energy in your next attempt" },
    ],
    "Tone Variation": [
        { level: "Low", min: 0, max: 50, comments: ["Your tone is monotone", "Limited variation in voice", "Delivery feels flat", "Needs vocal modulation", "Low engagement"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "Medium", min: 51, max: 65, comments: ["Some variation in tone", "Voice modulation is moderate", "Can improve expressiveness", "Partially engaging tone", "Balanced tone usage"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "High", min: 66, max: 100, comments: ["Good variation in tone", "Expressive voice delivery", "Highly engaging tone", "Strong vocal modulation", "Excellent voice dynamics"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
    ],
    "Articulation": [
        { level: "Low", min: 0, max: 50, comments: ["Words are not clearly pronounced", "Speech is difficult to understand", "Needs clearer articulation", "Mumbling detected", "Low clarity in speech"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "Medium", min: 51, max: 65, comments: ["Most words are clear", "Minor clarity issues", "Generally understandable", "Can improve pronunciation", "Slight inconsistencies"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "High", min: 66, max: 100, comments: ["Clear and crisp speech", "Easy to understand", "Strong pronunciation", "Professional delivery", "Excellent articulation"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
    ],
    "Emotion": [
        { level: "Low", min: 0, max: 50, comments: ["Limited emotional expression", "You appear neutral throughout", "Lacks engagement", "No variation in emotion", "Low expressiveness"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "Medium", min: 51, max: 65, comments: ["Some emotional variation", "Occasional engagement", "Moderate expression", "Can be more expressive", "Balanced but not strong"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "High", min: 66, max: 100, comments: ["Strong emotional expression", "Engaging and expressive", "Good variation in delivery", "High audience connect", "Excellent expressiveness"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
    ],
    "Pitch (Voice)": [
        { level: "Low", min: 0, max: 50, comments: ["Voice pitch is too low or flat", "May sound dull", "Needs variation", "Low vocal energy", "Not engaging"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "Medium", min: 51, max: 65, comments: ["Pitch is stable", "Some variation present", "Moderately engaging voice", "Balanced delivery", "Can improve slightly"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "High", min: 66, max: 100, comments: ["Good pitch variation", "Engaging voice tone", "Dynamic vocal delivery", "Strong presence", "Highly engaging voice"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
    ],
    "Pause Ratio": [
        { level: "Low", min: 0, max: 50, comments: ["Very few pauses detected", "Delivery feels rushed", "No breathing space between points", "Hard to process content", "Add short pauses"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "Medium", min: 51, max: 65, comments: ["Some pauses present", "Flow is mostly balanced", "Occasional breathing space", "Can improve pacing", "Moderate pause control"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "High", min: 66, max: 100, comments: ["Too many pauses", "Delivery feels broken", "Flow is disrupted", "Frequent gaps reduce impact", "Reduce unnecessary pauses"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
    ],
    "Sentence Structure": [
        { level: "Low", min: 0, max: 40, comments: ["Sentences lack formal structure", "Grammar could be sharper", "Inconsistent logical flow", "Phrasing feels disjointed", "Needs better composition"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "Medium", min: 41, max: 70, comments: ["Good overall structure", "Clear sentence flow", "Reasonable grammatical clarity", "Consistent logical progression", "Balanced composition"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
        { level: "High", min: 71, max: 100, comments: ["Excellent sentence structure", "Very articulate and polished", "Flawless logical flow", "Strong grammatical clarity", "Professional phrasing"], impact: "Improving this enhances delivery impact", fix: "Practice targeted improvement" },
    ],
};

const getMetricFeedback = (name, score, forcePositive = false) => {
    const config = metricsConfig[name] || metricsConfig["Articulation"];
    let levelObj;

    if (forcePositive) {
        // For the 'Strongest' card, ensure we show a positive tone
        levelObj = config[2] || config[1]; // Try High, then Medium
    } else {
        levelObj = config.find(l => score >= l.min && score <= l.max) || config[1];
    }

    return {
        level: levelObj.level,
        description: levelObj.comments[Math.floor(Math.random() * levelObj.comments.length)],
        color: levelObj.level === "High" ? "#22C55E" : levelObj.level === "Medium" ? "#F59E0B" : "#EF4444",
        impact: levelObj.impact,
        fix: levelObj.fix
    };
};

const headlineTable = [
    {
        primary: "Clarity", secondary: "Confidence", weakness: "EQ",
        options: [
            "Clear and Confident Communicator, Building People Signals",
            "Structured and Assured Speaker with Growing EQ",
            "Strong Clarity and Confidence, Improving People Impact",
            "Clear Thinker with Confident Delivery, Building EQ",
            "Sharp Communicator with Emerging People Awareness"
        ]
    },
    {
        primary: "Confidence", secondary: "Energy", weakness: "Clarity",
        options: [
            "Confident and Energetic Speaker with Strong Clarity",
            "High Presence and Energy, Communicating Clearly",
            "Assertive and Engaging, Building Structured Clarity",
            "Strong Confidence with Dynamic Energy and Clear Delivery",
            "Engaging Speaker with High Confidence and Improving Structure"
        ]
    },
    {
        primary: "Authenticity", secondary: "Clarity", weakness: "Confidence",
        options: [
            "Authentic and Clear Communicator, Building Confidence",
            "Genuine Speaker with Strong Clarity, Improving Presence",
            "Natural and Structured, Growing Confidence",
            "Sincere Communicator with Clear Thinking, Building Confidence",
            "Authentic Delivery with Strong Clarity and Emerging Confidence"
        ]
    },
    {
        primary: "Energy", secondary: "Confidence", weakness: "Pause Ratio",
        options: [
            "High Energy and Confidence, Improve Pacing Control",
            "Dynamic and Confident, Balance Your Pauses",
            "Strong Presence with Energy, Smoothen Delivery Flow",
            "Energetic Communicator, Improve Pause Balance",
            "Engaging and Confident, Refine Your Delivery Rhythm"
        ]
    }
];

const selectHeadline = (scores, weaknessName = "Clarity") => {
    // Map internal keys to display names used in the table
    const allMetrics = [
        { name: "Clarity", score: scores.clarity },
        { name: "Confidence", score: scores.confidence },
        { name: "Authenticity", score: scores.authenticity },
        { name: "EQ", score: scores.eq },
        { name: "Energy", score: scores.energy },
        { name: "Pause Ratio", score: scores.pauseRatio },
    ];

    const sorted = [...allMetrics].sort((a, b) => b.score - a.score);
    const primary = sorted[0].name;
    const secondary = sorted[1].name;
    const weakness = weaknessName; // Use the coordinated weakness from display logic

    // Find exact or partial match
    let matched = headlineTable.find(r => r.primary === primary && r.secondary === secondary && r.weakness === weakness);

    if (!matched) {
        // Fallback: match by primary only
        matched = headlineTable.find(r => r.primary === primary) || headlineTable[0];
    }

    return matched.options[Math.floor(Math.random() * matched.options.length)];
};

export default function FeedbackScreen({ route, navigation }) {
    const [vId, setVId] = useState(route?.params?.videoId);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        total: null,
        speech: null,
        facial: null,
        video: null,
        percentile: 0
    });

    useEffect(() => {
        const checkVideoId = async () => {
            if (!vId) {
                const storedId = await AsyncStorage.getItem("videoId");
                if (storedId) setVId(storedId);
                else setLoading(false);
            }
        };
        checkVideoId();
    }, [route?.params?.videoId]);

    const fetchData = async () => {
        try {
            const [totalRes, speechRes, facialRes, videoRes, percentileRes] = await Promise.allSettled([
                apiClient.get(`api/totalscore/video/${vId}`),
                apiClient.get(`api/scores/video/${vId}`),
                apiClient.get(`api/facial-score/video/${vId}`),
                apiClient.get(`api/videos/${vId}`),
                apiClient.get(`api/totalscore/video/${vId}/percentile`)
            ]);

            console.log("Total Score API Response:", totalRes.status === 'fulfilled' ? totalRes.value.data : totalRes.reason);
            console.log("Speech Score API Response:", speechRes.status === 'fulfilled' ? speechRes.value.data : speechRes.reason);
            console.log("Facial Score API Response:", facialRes.status === 'fulfilled' ? facialRes.value.data : facialRes.reason);

            const pData = percentileRes.status === 'fulfilled' ? (percentileRes.value.data || 0) : 0;
            const finalPercentile = typeof pData === 'object' ? (pData.percentile || Object.values(pData)[0] || 0) : pData;

            const newData = {
                total: totalRes.status === 'fulfilled' ? totalRes.value.data : null,
                speech: speechRes.status === 'fulfilled' ? speechRes.value.data : null,
                facial: facialRes.status === 'fulfilled' ? facialRes.value.data : null,
                video: videoRes.status === 'fulfilled' ? videoRes.value.data : null,
                percentile: finalPercentile
            };
            console.log("Final Processed Data State:", newData);
            setData(newData);
        } catch (err) {
            console.log("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (vId) fetchData();
    }, [vId]);

    if (!vId && !loading) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No video ID found in params or storage.</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    // Process scores for the UI with deep null checking
    const getScore = (val) => {
        const n = Number(val);
        return isNaN(n) ? 0 : n;
    };

    const scores = {
        clarity: getScore(data.total?.clarityScore) * 50,
        confidence: getScore(data.total?.confidenceScore) * 50,
        authenticity: getScore(data.total?.authenticityScore) * 50,
        eq: getScore(data.total?.eqScore || data.total?.emotionalScore) * 50,
        eyeContact: getScore(data.facial?.eyeContactScore) * 50,
        speechRate: getScore(data.speech?.speechRateScore) * 50,
        energy: getScore(data.speech?.energyScore) * 50,
        pauseRatio: getScore(data.speech?.pauseRatioScore) * 50,
        overall: getScore(data.total?.totalScore)
    };

    const allPotentialMetrics = [
        data.speech?.speechRateScore !== undefined && { title: "Speech Rate", icon: "mic", score: getScore(data.speech?.speechRateScore) * 50 },
        data.speech?.fillerWordScore !== undefined && { title: "Filler Words", icon: "scissors", score: getScore(data.speech?.fillerWordScore) * 50 },
        data.speech?.energyScore !== undefined && { title: "Energy", icon: "zap", score: getScore(data.speech?.energyScore) * 50 },
        data.speech?.toneScore !== undefined && { title: "Tone Variation", icon: "music", score: getScore(data.speech?.toneScore) * 50 },
        data.speech?.articulationScore !== undefined && { title: "Articulation", icon: "edit-2", score: getScore(data.speech?.articulationScore) * 50 },
        data.speech?.pitchScore !== undefined && { title: "Pitch (Voice)", icon: "bar-chart", score: getScore(data.speech?.pitchScore) * 50 },
        data.facial?.eyeContactScore !== undefined && { title: "Eye Contact", icon: "eye", score: getScore(data.facial?.eyeContactScore) * 50 },
        data.facial?.smileScore !== undefined && { title: "Smile", icon: "smile", score: getScore(data.facial?.smileScore) * 50 },
        (data.speech?.emotionScore !== undefined || data.facial?.emotionScore !== undefined) && {
            title: "Emotion",
            icon: "sun",
            score: getScore(data.speech?.emotionScore || data.facial?.emotionScore) * 50
        },
    ].filter(Boolean);

    // Identify the 4 lowest scores with a randomized tie-breaker for same scores
    console.log("All Potential Metrics with raw scores:", allPotentialMetrics);
    const lowestFour = [...allPotentialMetrics]
        .sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return Math.random() - 0.5; // Randomize order if scores are identical
        })
        .slice(0, 4);
    console.log("Identified Lowest Four:", lowestFour);

    const displayMetrics = lowestFour.map(m => ({
        ...m,
        ...getMetricFeedback(m.title, m.score)
    }));

    // Determine the highest among the 4 core soft skills (Clarity, Confidence, Authenticity, EQ)
    const softSkills = [
        { name: "Clarity", score: scores.clarity },
        { name: "Confidence", score: scores.confidence },
        { name: "Authenticity", score: scores.authenticity },
        { name: "EQ", score: scores.eq },
    ].sort((a, b) => b.score - a.score);
    const topSkill = softSkills[0];

    // Dynamic strings based on scores with fallback safety
    const highestMetric = {
        title: topSkill.name,
        score: topSkill.score,
        ...getMetricFeedback(topSkill.name, topSkill.score, true)
    };
    const lowestMetric = displayMetrics[0] || allPotentialMetrics[0] || { title: "Growth Area", score: 0, description: "Continue practicing for more detailed insights." };

    // Logic for dynamic 'Comment 1' based on user table
    const getComment1 = (name, score, percentile) => {
        let level;
        if (score <= 50) level = "Low";
        else if (score <= 65) level = "Medium";
        else level = "High";

        const comments = {
            Clarity: {
                Low: `You sound less structured than ${percentile}% of candidates`,
                Medium: `You are clearer than ${percentile}% of candidates`,
                High: `You are clearer than ${percentile}% of candidates`,
            },
            Confidence: {
                Low: `You appear less confident than ${percentile}% of candidates`,
                Medium: `You appear more confident than ${percentile}% of candidates`,
                High: `You appear more confident than ${percentile}% of candidates`,
            },
            Authenticity: {
                Low: "Pitch feels scripted",
                Medium: `You sound genuine than ${percentile}% of candidates`,
                High: `You sound more genuine than ${percentile}% of candidates`,
            },
            EQ: {
                Low: "Lacks team signals",
                Medium: `You show better EQ than ${percentile}% of candidates`,
                High: `You show better EQ than ${percentile}% of candidates`,
            }
        };

        const result = comments[name]?.[level] || `✔ Your ${name} is better than ${percentile}% of aspirants`;
        return (level !== "Low" ? "✔ " : "⚠ ") + result;
    };

    const headline = selectHeadline(scores, lowestMetric.title) || "Analyzing your performance...";
    const originalPercentile = data.percentile || Math.round(getScore(scores.overall) * 0.95);
    const percentileText = getComment1(topSkill.name, topSkill.score, originalPercentile);
    const gapAnalysis = lowestMetric?.title ? `⚠ Biggest Gap: ${lowestMetric.title} is your main area for growth.` : "⚠ We're still identifying your growth areas.";

    const insightTemplates = [
        `During this session, your ${highestMetric.title} stood out significantly. Balancing this with improved ${lowestMetric.title} will elevate your professional presence.`,
        `You project a strong sense of ${highestMetric.title}, which is a vital asset. To reach the next level, refining your ${lowestMetric.title} should be your primary focus.`,
        `The most impressive aspect of your delivery was your ${highestMetric.title}. We've identified ${lowestMetric.title} as your biggest opportunity for growth in your next attempt.`,
        `Your naturally high ${highestMetric.title} creates a positive impression. Integrating more consistent ${lowestMetric.title} will result in a much more balanced and impactful delivery.`,
        `With such strong ${highestMetric.title}, you've built a solid foundation. Our AI analysis suggests that sharpening your ${lowestMetric.title} is the final piece of the puzzle.`
    ];
    const insightText = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];

    const checkList = [...new Set(displayMetrics.map(m => m.fix || `Practice and improve your ${m.title}`))]
        .filter(tip => tip !== "Practice targeted improvement")
        .slice(0, 3);

    if (checkList.length < 3) {
        if (!checkList.includes("Record your next attempt in a quiet, well-lit environment")) {
            checkList.push("Record your next attempt in a quiet, well-lit environment");
        }
        if (checkList.length < 3 && !checkList.includes("Focus on maintaining a natural and approachable posture")) {
            checkList.push("Focus on maintaining a natural and approachable posture");
        }
    }
    if (!checkList.includes("Structure your answers with the STAR method for better clarity")) {
        checkList.push("Structure your answers with the STAR method for better clarity");
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Review</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* HEADLINE */}
                <Text style={styles.headline}>{headline}</Text>

                <Text style={styles.percentile}>{percentileText}</Text>

                <Text style={styles.gap}>{gapAnalysis}</Text>

                {/* METRICS GRID */}
                <View style={styles.grid}>
                    {displayMetrics.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Icon name={item.icon} size={18} color="#fff" />
                                <Text style={styles.cardTitle}>{item.title}</Text>
                            </View>

                            <View style={[styles.tag, { backgroundColor: item.color }]}>
                                <Text style={styles.tagText}>{item.level}</Text>
                            </View>

                            <Text style={styles.cardDesc}>{item.description}</Text>
                        </View>
                    ))}
                </View>

                {/* INSIGHT */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🪞 How you came across</Text>
                    <Text style={styles.sectionText}>
                        {insightText}
                    </Text>
                </View>

                {/* STRENGTH + GAP */}
                <View style={styles.row}>
                    <View style={styles.strengthCard}>
                        <Text style={styles.strengthTitle}>🟢 Strongest: {highestMetric.title}</Text>
                        <Text style={styles.strengthText}>
                            {highestMetric.description}
                        </Text>
                    </View>

                    <View style={styles.gapCard}>
                        <Text style={styles.gapTitle}>🔴 Improve: {lowestMetric.title}</Text>
                        <Text style={styles.gapText}>
                            {lowestMetric.description}
                        </Text>
                    </View>
                </View>

                {/* CHECKLIST */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎯 Improve your next attempt</Text>

                    {checkList.map((item, i) => (
                        <View key={i} style={styles.checkItem}>
                            <View style={styles.checkbox} />
                            <Text style={styles.checkText}>{item}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
        padding: 16,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 60,
    },
    loader: {
        flex: 1,
        backgroundColor: "#0F172A",
        justifyContent: "center",
        alignItems: "center",
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1E293B",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 12,
    },
    headline: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 12,
        lineHeight: 28,
    },

    percentile: {
        color: "#9CA3AF",
        marginBottom: 8,
    },

    gap: {
        color: "#F59E0B",
        marginBottom: 16,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    card: {
        width: "48%",
        backgroundColor: "#1E293B",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },

    cardTitle: {
        color: "#fff",
        marginLeft: 6,
        fontWeight: "600",
    },

    tag: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginBottom: 6,
    },

    tagText: {
        color: "#fff",
        fontSize: 12,
    },

    cardDesc: {
        color: "#CBD5F5",
        fontSize: 12,
    },

    section: {
        marginTop: 16,
        backgroundColor: "#1E293B",
        padding: 16,
        borderRadius: 12,
    },

    sectionTitle: {
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 8,
    },

    sectionText: {
        color: "#CBD5F5",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },

    strengthCard: {
        width: "48%",
        backgroundColor: "#052e16",
        padding: 12,
        borderRadius: 12,
    },

    gapCard: {
        width: "48%",
        backgroundColor: "#3f1d1d",
        padding: 12,
        borderRadius: 12,
    },

    strengthTitle: {
        color: "#22C55E",
        fontWeight: "bold",
        marginBottom: 4,
    },

    strengthText: {
        color: "#D1FAE5",
    },

    gapTitle: {
        color: "#EF4444",
        fontWeight: "bold",
        marginBottom: 4,
    },

    gapText: {
        color: "#FECACA",
    },

    checkItem: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },

    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: "#fff",
        marginRight: 10,
    },

    checkText: {
        color: "#fff",
    },

    impact: {
        marginTop: 16,
        padding: 12,
        backgroundColor: "#064e3b",
        borderRadius: 12,
    },

    impactText: {
        color: "#6EE7B7",
    },

    cta: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: "#6366F1",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },

    ctaText: {
        color: "#fff",
        fontWeight: "bold",
    },
    errorContainer: {
        flex: 1,
        backgroundColor: "#0F172A",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    errorText: {
        color: "#EF4444",
        textAlign: "center"
    }
});