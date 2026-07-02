const actorRecords = [
  {
    slug: 'mia-wasikowska', name: 'Mia Wasikowska', topCast: true, knownForRole: 'Alice Kingsleigh',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Mia_Wasikowska_Sundance_2026_v2.jpg/960px-Mia_Wasikowska_Sundance_2026_v2.jpg',
    age: 36, spouse: 'Not publicly disclosed', parents: ['John Reid', 'Marzena Wasikowska'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Mia_Wasikowska' },
    biography: [
      'Mia Wasikowska broke through internationally with a style that blends restraint and intensity. Her performances often carry emotional complexity without relying on theatricality.',
      'She became globally recognized for Alice Kingsleigh, while also building a respected career in independent drama with directors who value subtle character work and psychological depth.',
      'Across period pieces, modern dramas, and literary adaptations, she is known for selecting projects that emphasize craft, atmosphere, and character nuance over celebrity-driven roles.'
    ],
    movieCredits: [
      { title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'Alice Kingsleigh' },
      { title: 'Alice Through the Looking Glass', year: 2016, rating: 6.2, role: 'Alice Kingsleigh' }
    ]
  },
  {
    slug: 'johnny-depp', name: 'Johnny Depp', topCast: true, knownForRole: 'Mad Hatter',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Johnny_Depp_2020.jpg',
    age: 62, spouse: 'Previously married to Lori Anne Allison and Amber Heard',
    parents: ['John Christopher Depp', 'Betty Sue Palmer'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Johnny_Depp', instagram: 'https://www.instagram.com/johnnydepp/' },
    biography: [
      'Johnny Depp is an American actor known for transformational performances, unconventional character choices, and collaborations with major auteur filmmakers.',
      'He developed a reputation for eccentric screen personas, moving between commercial franchises and darker dramatic work that highlights voice, movement, and visual identity.',
      'His career spans decades of box-office hits and character-driven roles, with sustained global recognition as one of Hollywoods most distinctive performers.'
    ],
    movieCredits: [
      { title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'Mad Hatter' },
      { title: 'Pirates of the Caribbean: The Curse of the Black Pearl', year: 2003, rating: 8.1, role: 'Jack Sparrow' }
    ]
  },
  {
    slug: 'helena-bonham-carter', name: 'Helena Bonham Carter', topCast: true, knownForRole: 'Red Queen',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/British-actress-Helena-Bonham-Carter-2019.jpg/960px-British-actress-Helena-Bonham-Carter-2019.jpg',
    age: 59, spouse: 'Not currently married', parents: ['Raymond Bonham Carter', 'Elena Bonham Carter'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Helena_Bonham_Carter' },
    biography: [
      'Helena Bonham Carter has built an acclaimed career in British and international cinema with a signature blend of intensity, wit, and theatrical imagination.',
      'She is celebrated for her ability to inhabit eccentric and emotionally layered characters in period dramas, fantasy films, and biographical projects.',
      'Her filmography reflects unusual range, moving comfortably from gothic stylization to intimate drama while maintaining a highly recognizable screen presence.'
    ],
    movieCredits: [
      { title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'Red Queen' },
      { title: 'Fight Club', year: 1999, rating: 8.8, role: 'Marla Singer' }
    ]
  },
  {
    slug: 'anne-hathaway', name: 'Anne Hathaway', topCast: true, knownForRole: 'White Queen',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Anne_Hathaway_at_The_Apprentice_in_NYC_03_%28cropped2%29.jpg',
    age: 43, spouse: 'Adam Shulman', parents: ['Gerald Hathaway', 'Kate McCauley Hathaway'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Anne_Hathaway', instagram: 'https://www.instagram.com/annehathaway/' },
    biography: [
      'Anne Hathaway is an Academy Award-winning actor recognized for balancing mainstream appeal with technically demanding dramatic performances.',
      'Her body of work includes musical roles, romantic comedies, science fiction, and prestige drama, often marked by emotional clarity and strong character arcs.',
      'She remains one of Hollywoods most versatile leading performers, with sustained critical and commercial success across multiple genres.'
    ],
    movieCredits: [
      { title: 'Interstellar', year: 2014, rating: 8.7, role: 'Dr. Amelia Brand' },
      { title: 'The Dark Knight Rises', year: 2012, rating: 8.4, role: 'Selina Kyle' }
    ]
  },
  {
    slug: 'crispin-glover', name: 'Crispin Glover', topCast: true, knownForRole: 'Stayne - Knave of Hearts',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Crispin_Glover_cropped_2010.jpg',
    age: 61, spouse: 'Not publicly disclosed', parents: ['Bruce Glover', 'Betty Krachey'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Crispin_Glover' },
    biography: [
      'Crispin Glover is known for stylized performances that lean into surreal tone, physical eccentricity, and unpredictable character choices.',
      'He developed a cult reputation by taking unconventional parts in genre films and independent productions that challenge mainstream expectations.',
      'Beyond acting, he has sustained a multidisciplinary creative profile, including directing and writing projects with distinctive visual language.'
    ],
    movieCredits: [{ title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'Stayne - Knave of Hearts' }]
  },
  {
    slug: 'matt-lucas', name: 'Matt Lucas', topCast: true, knownForRole: 'Tweedledee',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Matt_Lucas_by_Gage_Skidmore.jpg/960px-Matt_Lucas_by_Gage_Skidmore.jpg',
    age: 52, spouse: 'Kevin McGee (former spouse)', parents: ['Diana Lucas', 'John Stanley Lucas'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Matt_Lucas', x: 'https://x.com/RealMattLucas' },
    biography: [
      'Matt Lucas is an English actor and comedian known for character-based comedy and elastic vocal performance.',
      'He expanded from sketch comedy into film and television roles, frequently playing memorable supporting parts in fantasy and family features.',
      'His work blends comic timing with theatrical expression, making him a recognizable presence across British and international productions.'
    ],
    movieCredits: [{ title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'Tweedledee and Tweedledum' }]
  },
  {
    slug: 'michael-sheen', name: 'Michael Sheen', topCast: true, knownForRole: 'White Rabbit (voice)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Michael_Sheen_crop_n2_Good_Omens_panel_at_NYCC_%2861104%29.jpg/1280px-Michael_Sheen_crop_n2_Good_Omens_panel_at_NYCC_%2861104%29.jpg',
    age: 57, spouse: 'Anna Lundberg', parents: ['Meyrick Sheen', 'Irene Sheen'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Michael_Sheen' },
    biography: [
      'Michael Sheen is a Welsh actor acclaimed for stage and screen performances that emphasize voice control, character rhythm, and psychological precision.',
      'He is especially respected for portraying real-world figures as well as fantastical characters, often shifting seamlessly between prestige drama and genre storytelling.',
      'Across film, television, and theater, he has sustained a reputation for detailed preparation and highly adaptive performance styles.'
    ],
    movieCredits: [{ title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'White Rabbit (voice)' }]
  },
  {
    slug: 'stephen-fry', name: 'Stephen Fry', topCast: true, knownForRole: 'Cheshire Cat (voice)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Stephen_Fry_at_Berlinale_2024_Ausschnitt.jpg/960px-Stephen_Fry_at_Berlinale_2024_Ausschnitt.jpg',
    age: 68, spouse: 'Elliott Spencer', parents: ['Alan John Fry', 'Marianne Eve Newman'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Stephen_Fry', x: 'https://x.com/stephenfry' },
    biography: [
      'Stephen Fry is an English actor, writer, and broadcaster widely recognized for literary wit, narration work, and refined comedic performance.',
      'His career spans television satire, dramatic acting, documentary hosting, and extensive voice work across film and audio projects.',
      'He is known for combining intellectual range with accessible storytelling, making him one of the most recognizable cultural figures in British media.'
    ],
    movieCredits: [{ title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'Cheshire Cat (voice)' }]
  },
  {
    slug: 'alan-rickman', name: 'Alan Rickman', topCast: true, knownForRole: 'Blue Caterpillar (voice)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Alan_Rickman_after_Seminar_%283%29.jpg/960px-Alan_Rickman_after_Seminar_%283%29.jpg',
    age: 69, spouse: 'Rima Horton', parents: ['Bernard Rickman', 'Margaret Doreen Rose'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Alan_Rickman' },
    biography: [
      'Alan Rickman was an English actor known for one of the most distinctive voices in modern cinema and theater.',
      'He brought precision, irony, and emotional control to antagonists and tragic characters, making many roles culturally iconic.',
      'His body of work remains influential for performers studying vocal presence, stillness, and layered character interpretation.'
    ],
    movieCredits: [
      { title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'Absolem (voice)' },
      { title: 'Harry Potter and the Deathly Hallows - Part 2', year: 2011, rating: 8.1, role: 'Severus Snape' }
    ]
  },
  {
    slug: 'barbara-windsor', name: 'Barbara Windsor', topCast: true, knownForRole: 'Dormouse (voice)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Barbara_Windsor_Maryebone_Tree.JPG',
    age: 83, spouse: 'Scott Mitchell', parents: ['John Deeks', 'Rose Deeks'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Barbara_Windsor' },
    biography: [
      'Barbara Windsor was an English actor and television personality with a long career across film, stage, and serial drama.',
      'She became a household name through both comedy and soap-opera work, recognized for expressive energy and instantly identifiable delivery.',
      'Her influence in British popular culture endured for decades, and her performances remain closely tied to major eras of UK entertainment.'
    ],
    movieCredits: [{ title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'Dormouse (voice)' }]
  },
  {
    slug: 'paul-whitehouse', name: 'Paul Whitehouse', topCast: true, knownForRole: 'March Hare',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Paul_Whitehouse_20231207.jpg/1280px-Paul_Whitehouse_20231207.jpg',
    age: 67, spouse: 'Mina Whitehouse', parents: ['Welsh and English family background'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Paul_Whitehouse' },
    biography: [
      'Paul Whitehouse is a Welsh actor and comedian recognized for his sharp sketch-comedy work and expressive character acting.',
      'He has contributed to influential British television comedies while also appearing in fantasy and family films.',
      'His screen style combines absurd humor with grounded timing, allowing him to stand out in both voice and live-action roles.'
    ],
    movieCredits: [{ title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'March Hare' }]
  },
  {
    slug: 'timothy-spall', name: 'Timothy Spall', topCast: true, knownForRole: 'Bayard Hamar',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Timothy_Spall_World_Premiere_The_Party_Berlinale_2017_02.jpg/960px-Timothy_Spall_World_Premiere_The_Party_Berlinale_2017_02.jpg',
    age: 69, spouse: 'Shane Spall', parents: ['Sylvia May Spall', 'Joseph L. Spall'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Timothy_Spall' },
    biography: [
      'Timothy Spall is an English actor respected for deeply human performances across historical drama, fantasy, and contemporary stories.',
      'He is frequently cast in roles that require emotional vulnerability, unusual physicality, or strong character transformation.',
      'His career includes acclaimed collaborations with major directors and a broad record of memorable supporting and leading roles.'
    ],
    movieCredits: [
      { title: 'Alice in Wonderland', year: 2010, rating: 6.4, role: 'Bayard Hamar' },
      { title: 'Harry Potter and the Prisoner of Azkaban', year: 2004, rating: 7.9, role: 'Peter Pettigrew' }
    ]
  },
  {
    slug: 'leonardo-dicaprio', name: 'Leonardo DiCaprio', topCast: false, knownForRole: 'Cobb in Inception',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/LeoPTABFI191125-28_%28cropped%29.jpg',
    age: 51, spouse: 'Not publicly disclosed', parents: ['George DiCaprio', 'Irmelin DiCaprio'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Leonardo_DiCaprio', instagram: 'https://www.instagram.com/leonardodicaprio/' },
    biography: [
      'Leonardo DiCaprio is an Academy Award-winning actor known for psychologically intense leading performances.',
      'He has collaborated repeatedly with high-profile directors, moving between historical epics, crime dramas, and existential thrillers.',
      'His career combines commercial drawing power with sustained critical acclaim and environmental activism outside film.'
    ],
    movieCredits: [
      { title: 'Inception', year: 2010, rating: 8.8, role: 'Dom Cobb' },
      { title: 'The Departed', year: 2006, rating: 8.5, role: 'Billy Costigan' },
      { title: 'The Wolf of Wall Street', year: 2013, rating: 8.2, role: 'Jordan Belfort' }
    ]
  },
  {
    slug: 'tom-hanks', name: 'Tom Hanks', topCast: false, knownForRole: 'Forrest Gump',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/TomHanksPrincEdw031223_%2811_of_41%29_%28cropped%29.jpg/960px-TomHanksPrincEdw031223_%2811_of_41%29_%28cropped%29.jpg',
    age: 70, spouse: 'Rita Wilson', parents: ['Amos Mefford Hanks', 'Janet Marylyn Frager'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Tom_Hanks' },
    biography: [
      'Tom Hanks is one of the most influential American actors of his generation, known for dramatic warmth and screen reliability.',
      'His filmography spans comedy, historical drama, war cinema, and animation, with multiple globally recognized roles.',
      'He remains a foundational Hollywood leading man whose work is often associated with empathy, moral conflict, and broad audience trust.'
    ],
    movieCredits: [
      { title: 'Forrest Gump', year: 1994, rating: 8.8, role: 'Forrest Gump' },
      { title: 'Saving Private Ryan', year: 1998, rating: 8.6, role: 'Captain Miller' },
      { title: 'The Green Mile', year: 1999, rating: 8.6, role: 'Paul Edgecomb' }
    ]
  },
  {
    slug: 'morgan-freeman', name: 'Morgan Freeman', topCast: true, knownForRole: 'Ellis Boyd Redding',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Morgan_Freeman_Deauville_2018.jpg/960px-Morgan_Freeman_Deauville_2018.jpg',
    age: 89, spouse: 'Previously married', parents: ['Mamay Edna', 'Morgan Porterfield Freeman'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Morgan_Freeman' },
    biography: [
      'Morgan Freeman is an American actor known for authoritative screen presence, resonant narration, and emotionally grounded performances.',
      'His career spans prison drama, crime thrillers, historical films, and large-scale studio franchises, often anchored by moral complexity.',
      'He remains one of the most recognizable voices and faces in cinema across multiple generations of film audiences.'
    ],
    movieCredits: [
      { title: 'The Shawshank Redemption', year: 1994, rating: 9.3, role: 'Ellis Boyd Redding' },
      { title: 'Se7en', year: 1995, rating: 8.6, role: 'Detective Somerset' },
      { title: 'The Dark Knight', year: 2008, rating: 9.0, role: 'Lucius Fox' }
    ]
  },
  {
    slug: 'keanu-reeves', name: 'Keanu Reeves', topCast: true, knownForRole: 'Neo',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Keanu_Reeves_%282023%29.jpg/960px-Keanu_Reeves_%282023%29.jpg',
    age: 62, spouse: 'Not publicly disclosed', parents: ['Patricia Taylor', 'Samuel Nowlin Reeves Jr.'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Keanu_Reeves' },
    biography: [
      'Keanu Reeves is a Canadian actor widely known for action and science-fiction roles with understated style and physical commitment.',
      'He became a global icon through cyberpunk storytelling and franchise action cinema while maintaining a steady dramatic career.',
      'His screen persona combines calm intensity with emotional restraint, making him a durable leading figure in modern genre film.'
    ],
    movieCredits: [
      { title: 'The Matrix', year: 1999, rating: 8.7, role: 'Neo' },
      { title: 'The Matrix Reloaded', year: 2003, rating: 7.2, role: 'Neo' },
      { title: 'The Matrix Revolutions', year: 2003, rating: 6.7, role: 'Neo' }
    ]
  },
  {
    slug: 'robert-de-niro', name: 'Robert De Niro', topCast: false, knownForRole: 'Vito Corleone',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Robert_De_Niro_Cannes_2016.jpg/960px-Robert_De_Niro_Cannes_2016.jpg',
    age: 83, spouse: 'Previously married', parents: ['Robert De Niro Sr.', 'Virginia Admiral'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Robert_De_Niro' },
    biography: [
      'Robert De Niro is an American actor whose performances in crime and character drama helped define modern screen acting in the late twentieth century.',
      'He is known for deep character immersion, physical transformation, and long-running collaborations with major directors.',
      'Across decades of film, he has sustained critical recognition while continuing to appear in both prestige and commercial productions.'
    ],
    movieCredits: [
      { title: 'The Godfather Part II', year: 1974, rating: 9.0, role: 'Young Vito Corleone' },
      { title: 'The Irishman', year: 2019, rating: 7.8, role: 'Frank Sheeran' },
      { title: 'Joker', year: 2019, rating: 8.4, role: 'Murray Franklin' }
    ]
  },
  {
    slug: 'cillian-murphy', name: 'Cillian Murphy', topCast: true, knownForRole: 'J. Robert Oppenheimer',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Cillian_Murphy-2014.jpg/960px-Cillian_Murphy-2014.jpg',
    age: 50, spouse: 'Yvonne McGuinness', parents: ['Brendan Murphy', 'Teacher mother'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Cillian_Murphy' },
    biography: [
      'Cillian Murphy is an Irish actor recognized for intense, psychologically focused performances in both independent cinema and major studio films.',
      'He has collaborated repeatedly with Christopher Nolan and is known for combining precision with quiet emotional volatility.',
      'His body of work spans war drama, thriller, science fiction, and historical biography with consistent critical acclaim.'
    ],
    movieCredits: [
      { title: 'Oppenheimer', year: 2023, rating: 8.4, role: 'J. Robert Oppenheimer' },
      { title: 'The Dark Knight', year: 2008, rating: 9.0, role: 'Dr. Jonathan Crane' },
      { title: 'Inception', year: 2010, rating: 8.8, role: 'Robert Fischer' }
    ]
  },
  {
    slug: 'christian-bale', name: 'Christian Bale', topCast: true, knownForRole: 'Bruce Wayne / Batman',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Christian_Bale-7839.jpg/960px-Christian_Bale-7839.jpg',
    age: 52, spouse: 'Sibi Blazic', parents: ['David Bale', 'Jenny James'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Christian_Bale' },
    biography: [
      'Christian Bale is an English actor known for physical transformation and immersive performance choices across genres.',
      'He has led high-profile franchises and delivered acclaimed dramatic roles in historical and psychological storytelling.',
      'His approach to craft emphasizes character specificity, vocal variation, and disciplined preparation for each role.'
    ],
    movieCredits: [
      { title: 'Batman Begins', year: 2005, rating: 8.2, role: 'Bruce Wayne / Batman' },
      { title: 'The Dark Knight', year: 2008, rating: 9.0, role: 'Bruce Wayne / Batman' },
      { title: 'The Dark Knight Rises', year: 2012, rating: 8.4, role: 'Bruce Wayne / Batman' }
    ]
  },
  {
    slug: 'robert-downey-jr', name: 'Robert Downey Jr.', topCast: false, knownForRole: 'Tony Stark / Iron Man',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Robert_Downey_Jr_SDCC_2014.jpg/960px-Robert_Downey_Jr_SDCC_2014.jpg',
    age: 61, spouse: 'Susan Downey', parents: ['Robert Downey Sr.', 'Elsie Ford'],
    social: { wikipedia: 'https://en.wikipedia.org/wiki/Robert_Downey_Jr.' },
    biography: [
      'Robert Downey Jr. is an American actor known for sharp comedic timing, charisma-driven leads, and dramatic reinvention.',
      'He became central to modern blockbuster cinema through interconnected superhero storytelling while maintaining awards-level dramatic work.',
      'His career is often cited as one of Hollywoods most visible comeback arcs, combining mainstream appeal with technical acting range.'
    ],
    movieCredits: [
      { title: 'Avengers: Infinity War', year: 2018, rating: 8.4, role: 'Tony Stark / Iron Man' },
      { title: 'Avengers: Endgame', year: 2019, rating: 8.4, role: 'Tony Stark / Iron Man' },
      { title: 'Oppenheimer', year: 2023, rating: 8.4, role: 'Lewis Strauss' }
    ]
  }
]

export const actors = actorRecords
export const topCast = actorRecords.filter((actor) => actor.topCast)
export const actorsBySlug = Object.fromEntries(actorRecords.map((actor) => [actor.slug, actor]))
export const actorSlugByName = Object.fromEntries(actorRecords.map((actor) => [actor.name, actor.slug]))
