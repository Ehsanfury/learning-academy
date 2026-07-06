import api from "./api";

const mentorApi = {
  getMentors: async (filters = {}) => {
    return api.get("/mentors", { params: filters });
  },

  getMentor: async (mentorId) => {
    return api.get(`/mentors/${mentorId}`);
  },

  getMentorAvailability: async (mentorId) => {
    return api.get(`/mentors/${mentorId}/availability`);
  },

  bookSession: async (mentorId, bookingData) => {
    return api.post(`/mentors/${mentorId}/book`, bookingData);
  },

  getMySessions: async () => {
    return api.get("/mentors/my-sessions");
  },
};

export default mentorApi;
