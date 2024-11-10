import axios from "axios";

async function getPapers(subject: string) {
    try {
      const res = await axios.get(`/api/papers?subject=${subject}`);
      if (res.status !== 200) {
        throw new Error('Failed to fetch papers');
      }
      return res.data;  
      
    } catch (error) {
      console.error('Error fetching papers:', error);
      throw error;
    }
  }

export default getPapers;

