const courses = [
  "Digital Logic and Microprocessors [BITE202L]",
  "Structured and Object-Oriented Programming Lab [BCSE102P]",
  "Calculus [BMAT101L]",
  "Basic Electrical and Electronics Engineering [BEEE102L]",
  "Engineering Physics Lab [BPHY101P]",
  "Probability and Statistics [BMAT202L]",
  "Technical English Communication Lab [BENG101P]",
  "Technical Report Writing [BENG102P]",
  "Computer Programming: Python [BCSE101E]",
  "Computer Communication and Networking [BECE401L]",
  "Engineering Chemistry Lab [BCHY101P]",
  "Calculus Lab [BMAT101P]",
  "Basic Electrical and Electronics Engineering Lab [BEEE102P]",
  "Complex Variables and Linear Algebra [BMAT201L]",
  "Computer Programming: Java [BCSE103E]",
  "Java Programming [CSE1007]",
  "Digital Logic and Microprocessors Lab [BITE202P]",
  "Differential Equations and Transforms [BMAT102L]",
  "Engineering Chemistry [BCHY101L]",
  "Computer Architecture and Organization [BITE301L]",
  "Structured and Object-Oriented Programming [BCSE102L]",
  "Principles of Communication Systems [BITE203L]",
  "Engineering Physics [BPHY101L]",
  "Probability and Statistics Lab [BMAT202P]",
  "Discrete Mathematics and Graph Theory [BMAT205L]",
  "Database Systems [BITE302L]",
  "Database Systems [BCSE302L]",
  "Operating Systems [BITE303L]",
  "Operating Systems [BCSE303L]",
  "Data Structures and Algorithms Lab [BITE201P]",
  "Technical English Communication [BENG101L]",
  "Quantitative Skills Practice I [BSTS101P]",
  "Quantitative Skills Practice II [BSTS102P]",
  "Web Technologies Lab [BITE304P]",
  "Computer Networks [BITE305L]",
  "Operating Systems Lab [BITE303P]",
  "Web Technologies [BITE304L]",
  "Theory of Computation [BITE306L]",
  "Theory of Computation [BCSE304L]",
  "Qualitative Skills Practice I [BSTS201P]",
  "Distributed Computing [BITE402L]",
  "Network and Information Security [BITE401L]",
  "Database Systems Lab [BITE302P]",
  "Computer Networks Lab [BITE305P]",
  "Qualitative Skills Practice II [BSTS202P]",
  "Big Data Analytics [BITE411L]",
  "Embedded Systems and IoT [BITE403L]",
  "Data Structures and Algorithms [BITE201L]",
  "Data Structures and Algorithms [BCSE202L]",
  "Software Engineering Lab [BITE307P]",
  "Computer Graphics [BITE313L]",
  "Multimedia Systems [BITE314L]",
  "Software Engineering [BITE307L]",
  "Control Systems [BECE302L]",
  "Embedded Systems and IoT Lab [BITE403P]",
  "Artificial Intelligence [BITE308L]",
  "Artificial Intelligence [BCSE306L]",
  "Human Computer Interaction [BITE311L]",
  "Laboratory Project [BITE393J]",
  "Technical Answers to Real Problems Project [BITE391J]",
  "Artificial Intelligence Lab [BITE308P]",
  "Product Development Project [BITE394J]",
  "Simulation Project [BITE398J]",
  "Reading Course [BITE396J]",
  "Object Oriented Analysis and Design [BITE404E]",
  "Data Mining [BITE312E]",
  "Design Project [BITE392J]",
  "Parallel Computing [BITE406L]",
  "Special Project [BITE397J]",
  "Machine Learning [BITE410L]",
  "Machine Learning [BCSE209L]",
  "Cloud Computing [BITE412L]",
  "Mobile Application Development [BITE409L]",
  "Network Management [BITE408L]",
  "Cyber Security [BITE413L]",
  "Soft Computing [BITE405L]",
  "Essentials Of Data Analytics [BCSE352E]",
  "Blockchain Technology [BITE414L]",
  "Quantum Computing [BITE407L]",
  "Engineering Optimization [BITE415L]",
  "Engineering Optimization [BMEE215L]",
  "Biology [BBIT100L]",
  "Biobusiness [BBIT311L]",
  "AWS Solutions Architect [BCSE355L]",
  "Electronic Materials and Devices [BECE201L]",
  "Materials Science and Engineering [BMEE209L]",
  "Electromagnetic Theory [BEEE202L]",
  "Rural Development [BHUM202L]",
  "Circuit Theory [BECE203L]",
  "Introduction to Psychology [BHUM203L]",
  "Industrial Psychology [BHUM204L]",
  "Mass Communication [BHUM201L]",
  "Development Economics [BHUM205L]",
  "International Economics [BHUM206L]",
  "Engineering Economics [BHUM207L]",
  "Economics of Strategy [BHUM208L]",
  "Game Theory [BHUM209L]",
  "Behavioral Economics [BHUM211L]",
  "Behavioral Economics [HUM1046]",
  "Econometrics [BHUM210E]",
  "Fluid Mechanics and Machines [BMEE204L]",
  "Cloud Computing using Salesforce [BMEE355L]",
  "Metal Casting and Welding [BMEE302L]",
  "Metal Forming and Machining [BMEE304L]",
  "Contemporary India [BHUM217L]",
  "Mathematics for Economic Analysis [BHUM212L]",
  "Corporate Social Responsibility [BHUM213L]",
  "Political Science [BHUM214L]",
  "Economics of Money, Banking and Financial Markets [BHUM221L]",
  "Kinematics and Dynamics of Machines [BMEE207L]",
  "Financial Management [BHUM218L]",
  "Security Analysis and Portfolio Management [BHUM222L]",
  "Indian Culture and Heritage [BHUM216L]",
  "Mechatronics and Measurement Systems [BMEE210L]",
  "International Relations [BHUM215L]",
  "Financial Markets and Institutions [BHUM220L]",
  "Principles of Accounting [BHUM219L]",
  "Options , Futures and other Derivatives [BHUM223L]",
  "Corporate Finance [BHUM226L]",
  "Engineering Thermodynamics [BMEE203L]",
  "Fixed Income Securities [BHUM224L]",
  "Personal Finance [BHUM225L]",
  "Cost and Management Accounting [BHUM228L]",
  "Health Humanities in Biotechnological Era [BHUM230L]",
  "Mind, Embodiment and Technology [BHUM229L]",
  "Financial Statement Analysis [BHUM227L]",
  "Environmental Psychology [BHUM233L]",
  "Introduction to Sustainable Aging [BHUM232L]",
  "Reproductive Choices for a Sustainable Society [BHUM231L]",
  "Taxation [BHUM236L]",
  "Psychology of Wellness [BHUM235E]",
  "Indian Psychology [BHUM234L]",
  "Design of Machine Elements [BMEE301L]",
  "Thermal Engineering Systems [BMEE303L]",
  "Mathematics [BMAT100L]",
  "Engineering Design Visualisation Lab [BMEE102P]",
  "Engineering Mechanics [BMEE201L]",
  "Entrepreneurship [BMGT108L]",
  "Mechanics of Solids [BMEE202L]",
  "Introduction to Intellectual Property [BMGT109L]",
  "Optics [BPHY201L]",
  "Computational Physics [BPHY301E]",
  "Physics Lab [BPHY302P]",
  "Classical Mechanics [BPHY202L]",
  "Electromagnetic Theory [BPHY402L]",
  "Quantum Mechanics [BPHY203L]",
  "Solid State Physics [BPHY401L]",
  "Atomic and Nuclear Physics [BPHY403L]",
  "Statistical Mechanics [BPHY404L]",
  "Advanced Competitive Coding - I [BSTS301P]",
  "Advanced Competitive Coding - II [BSTS302P]",
  "E-Business [CFOC133M]",
  "Emotional Intelligence [CFOC105M]",
  "Forests and their Management [CFOC191M]",
  "Ethical Hacking [CFOC188M]",
  "Rocket Propulsion [CFOC235M]",
  "Natural Hazards [CFOC203M]",
  "Training of Trainers [CFOC119M]",
  "Compiler Design [BCSE307L]",
  "Business Statistics [CFOC498M]",
  "Entrepreneurship Essentials [CFOC384M]",
  "Public Speaking [CFOC570M]",
  "Speaking Effectively [CFOC395M]",
  "Wildlife Ecology [CFOC575M]",
  "International Business [CFOC543M]",
  "Entrepreneurship [CFOC508M]",
  "Ethics and Values [BHUM101N]",
  "Economics of Banking and Finance Markets [CFOC587M]",
  "Indian Constitution [BSSC102N]",
  "Leadership and Team Effectiveness [CFOC599M]",
  "Effective English Communication [BENG101N]",
  "Environmental Sciences [BCHY102N]",
  "Essence of Traditional Knowledge [BSSC101N]",
  "Introduction to Engineering [BITE101N]",
  "Chinese I [BCHI101L]",
  "Arabic [BARB101L]",
  "Modern Greek [BGRE101L]",
  "Spanish I [BESP101L]",
  "French I [BFRE101L]",
  "German I [BGER101L]",
  "Basic Korean - Level 1 [BKOR101L]",
  "Italian [BITL101L]",
  "Basic Korean - Level 2 [BKOR102L]",
  "Global Warming [BCLE214L]",
  "Waste Management [BCLE215L]",
  "Japanese I [BJAP101L]",
  "Natural Disaster Mitigation and Management [BCLE212L]",
  "Indian Classical Music [BHUM102E]",
  "Water Resource Management [BCLE216L]",
  "Micro Economics [BHUM103L]",
  "Macro Economics [BHUM104L]",
  "Sustainability and Society [BHUM107L]",
  "Principles of Sociology [BHUM106L]",
  "Public Policy and Administration [BHUM105L]",
  "Urban Community Development [BHUM108L]",
  "Social Work and Sustainability [BHUM109L]",
  "Principles of Management [BMGT101L]",
  "Organizational Behavior [BMGT103L]",
  "Cognitive Psychology [BHUM110]",
  "Microprocessors and Microcontrollers Lab [BEEE309P]",
  "Microprocessors and Microcontrollers [BECE204L]",
  "Big Data Analytic Applications to Electrical Systems [BECS403L]",
  "Big Data Analytic Applications to Electrical Systems Lab [BECS403P]",
  "Cyber Security [BCSE410L]",
  "Introduction to The Art of Hunting Cryptically [CRY2024]",
  "Analog Circuits [BECE206L]",
  "Analog Communication Systems [BECE304L]",
  "Antenna and Microwave Engineering [BECE305L]",
  "AWS for Cloud Computing [BECE355L]",
  "Digital System Design [BECE102L]",
  "Sensors technology [BECE409E]",
  "Robotics and Automation [BECE312L]",
  "Random Processes [BECE207L]",
  "VLSI System Design [BECE303L]",
  "Digital Communication System [BECE306L]",
  "Computer Networks [BCSE308L]",
  "Foundations of Data Analytics [BCSE351E]",
  "Embedded Systems Design [BECE403E]",
  "Electronic Devices and Circuits [BECE205L]",
  "Linear Algebra [UMAT201L]",
  "Digital Watermarking and Steganography [BCSE323L]",
  "Electronic Circuits [BEVD204L]",
  "Digital Signal Processing [BECE301L]",
  "Signals and Systems [BECE202L]",
  "Signals and Systems [BEEE204L]",
  "Engineering Electromagnetics [BECE205L]",
  "Digital Electronics [BEEE206L]",
  "Artficial Intelligence [CBS3004]",
  "Information Security [CBS3002]",
  "Design and Analysis of Algorithms [MCSE502L]",
];

const slots: string[] = [
  "A1",
  "B1",
  "C1",
  "D1",
  "E1",
  "F1",
  "G1",
  "A2",
  "B2",
  "C2",
  "D2",
  "E2",
  "F2",
  "G2",
];
function getYears(startYear: number) {
  const currentYear = new Date().getFullYear(); // Get the current year
  const years = [];

  // Loop from startYear to currentYear and add each year to the array
  for (let year = startYear; year <= currentYear; year++) {
    years.push(String(year));
  }

  return years;
}

// Example usage:
const startYear = 2011;
const years = getYears(startYear);
const campuses: string[] = [
  "Vellore",
  "Chennai",
  "Andhra Pradesh",
  "Bhopal",
  "Bangalore",
  "Mauritius",
];
const exams: string [] = ["CAT-1", "CAT-2", "FAT","Model CAT-1" , "Model CAT-2" , "Model FAT"]
const semesters: string[] = ["Fall Semester", "Winter Semester", "Summer Semester", "Weekend Semester"];
export { slots, courses, years, campuses, semesters, exams };
