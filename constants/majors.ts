import { School, Major } from '@/types/major';

export const schools: School[] = [
  {
    name: "Harry W. Bass Jr. School of Arts, Humanities, and Technology",
    majors: [
      {
        name: "Arts, Technology, and Emerging Communication",
        concentrations: ["Animation and Games", "Critical Media Studies", "Emerging Media Arts"],
        degree: "BA"
      },
      { name: "History", degree: "BA" },
      { name: "Latin American Studies", degree: "BA" },
      {
        name: "Literature",
        concentrations: ["Creative Writing", "Rhetoric and Communication", "Spanish"],
        degree: "BA"
      },
      { name: "Philosophy", degree: "BA" },
      {
        name: "Visual and Performing Arts",
        concentrations: ["Art History", "Communication", "Dance", "Film", "Interdisciplinary Arts", "Music", "Photo Video Digital"],
        degree: "BA"
      }
    ]
  },
  {
    name: "School of Behavioral and Brain Sciences",
    majors: [
      { name: "Child Learning and Development", degree: "BS" },
      { name: "Cognitive Science", degree: "BS" },
      { name: "Neuroscience", degree: "BS" },
      { name: "Psychology", degree: "BS" },
      { name: "Speech, Language, and Hearing Sciences", degree: "BS" }
    ]
  },
  {
    name: "School of Economic, Political and Policy Sciences",
    majors: [
      { name: "Criminology", degree: "BA" },
      { name: "Economics", degree: "BA" },
      { name: "International Political Economy", degree: "BA" },
      { name: "Political Science", degree: "BA" },
      { name: "Sociology", degree: "BA" }
    ]
  },
  {
    name: "Erik Jonsson School of Engineering and Computer Science",
    majors: [
      { name: "Biomedical Engineering", degree: "BS" },
      { name: "Computer Engineering", degree: "BS" },
      { name: "Computer Science", degree: "BS" },
      { name: "Electrical Engineering", degree: "BS" },
      { name: "Mechanical Engineering", degree: "BS" },
      { name: "Software Engineering", degree: "BS" },
      { name: "Systems Engineering", degree: "BS" }
    ]
  },
  {
    name: "Naveen Jindal School of Management",
    majors: [
      { name: "Accounting", degree: "BS" },
      {
        name: "Business Administration",
        concentrations: [
          "Business Economics",
          "Energy Management",
          "Innovation and Entrepreneurship",
          "Professional Sales",
          "Real Estate Investment Management",
          "Risk Management and Cyber Security"
        ],
        degree: "BS"
      },
      { name: "Business Analytics and Artificial Intelligence", degree: "BS" },
      { name: "Computer Information Systems & Technology", degree: "BS" },
      { name: "Finance", degree: "BS" },
      { name: "Global Business", degree: "BS" },
      { name: "Healthcare Management", degree: "BS" },
      { name: "Human Resource Management", degree: "BS" },
      { name: "Marketing", degree: "BS" },
      { name: "Supply Chain Management and Analytics", degree: "BS" }
    ]
  },
  {
    name: "School of Natural Sciences and Mathematics",
    majors: [
      { name: "Biology", degree: "BS" },
      { name: "Chemistry", degree: "BS" },
      { name: "Geosciences", degree: "BS" },
      { name: "Mathematics", degree: "BS" },
      { name: "Molecular Biology", degree: "BS" },
      { name: "Physics", degree: "BS" }
    ]
  },
  {
    name: "School of Interdisciplinary Studies",
    majors: [
      { name: "Interdisciplinary Studies", degree: "BA" },
      { name: "Healthcare Studies", degree: "BS" }
    ]
  }
];

// Flatten all majors for search
export const allMajors = schools.flatMap(school => 
  school.majors.map(major => ({
    ...major,
    school: school.name
  }))
);