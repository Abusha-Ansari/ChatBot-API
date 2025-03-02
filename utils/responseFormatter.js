const cleanResponse = (text) => {
    return text.replace(/[*_`]+/g, "").replace(/\s+/g, " ").trim();
  };
  
  export default cleanResponse;
  