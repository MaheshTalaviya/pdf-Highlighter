function handleChange(e) {
  console.log(e.target.value)
  //handler
}
function pdfUI() { 

  return (
    <div>
     
      <textarea
        name="queshtionTitle"
        onChange={handleChange}
        
      />
    </div>
  );
}
export default pdfUI;