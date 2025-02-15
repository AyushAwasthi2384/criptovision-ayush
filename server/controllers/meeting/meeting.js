const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

// add meeting
const add = async (req, res) => {
    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy } = req.body;

        if (!agenda || !createBy) {
            return res.status(400).json({ message: "Agenda and Created By fields are required" });
        }

        const newMeeting = new MeetingHistory({
            agenda,
            attendes,
            attendesLead,
            location,
            related,
            dateTime,
            notes,
            createBy
        });

        await newMeeting.save();
        res.status(201).json({ message: "Meeting created successfully", meeting: newMeeting });

    } catch (error) {
        res.status(500).json({ message: "Error adding meeting", error: error.message });
    }
};

// all meetings
const index = async (req, res) => {
    try {
        const meetings = await MeetingHistory.find({ deleted: false })
            .populate('attendes')
            .populate('attendesLead')
            .populate('createBy');

        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meetings", error: error.message });
    }
};

// meeting by ID
const view = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Meeting ID" });
        }

        const meeting = await MeetingHistory.findById(id)
            .populate('attendes')
            .populate('attendesLead')
            .populate('createBy');

        if (!meeting || meeting.deleted) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json(meeting);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meeting", error: error.message });
    }
};

// soft delete 1 meeting
const deleteData = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Meeting ID" });
        }

        const meeting = await MeetingHistory.findByIdAndUpdate(id, { deleted: true }, { new: true });

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json({ message: "Meeting deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting meeting", error: error.message });
    }
};

// soft delete many meetings
const deleteMany = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: "Invalid request, provide an array of meeting IDs" });
        }

        await MeetingHistory.updateMany(
            { _id: { $in: ids } },
            { deleted: true }
        );

        res.status(200).json({ message: "Meetings deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting meetings", error: error.message });
    }
};

module.exports = { add, index, view, deleteData, deleteMany };
