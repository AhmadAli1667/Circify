const coreMovies = [
  { title: 'The Shawshank Redemption', year: 1994, genre: ['Drama'], director: 'Frank Darabont', leadCast: ['Tim Robbins', 'Morgan Freeman'], rating: 9.3, synopsis: 'A banker sentenced to life imprisonment builds an unlikely friendship and a long game for freedom inside Shawshank prison.', relatedTitle: null },
  { title: 'The Godfather', year: 1972, genre: ['Crime', 'Drama'], director: 'Francis Ford Coppola', leadCast: ['Marlon Brando', 'Al Pacino'], rating: 9.2, synopsis: 'The aging patriarch of a crime dynasty hands power to his reluctant son as loyalty and violence reshape the family.', relatedTitle: 'The Godfather Part II' },
  { title: 'The Godfather Part II', year: 1974, genre: ['Crime', 'Drama'], director: 'Francis Ford Coppola', leadCast: ['Al Pacino', 'Robert De Niro'], rating: 9.0, synopsis: 'Parallel timelines follow Vito Corleone rising in New York and Michael Corleone tightening control over the family empire.', relatedTitle: 'The Godfather' },
  { title: 'The Dark Knight', year: 2008, genre: ['Action', 'Crime', 'Drama'], director: 'Christopher Nolan', leadCast: ['Christian Bale', 'Heath Ledger'], rating: 9.0, synopsis: 'Batman faces the Joker, whose escalating chaos forces Gotham to question justice, sacrifice, and heroism.', relatedTitle: 'Batman Begins' },
  { title: 'Batman Begins', year: 2005, genre: ['Action', 'Crime', 'Drama'], director: 'Christopher Nolan', leadCast: ['Christian Bale', 'Michael Caine'], rating: 8.2, synopsis: 'After years away, Bruce Wayne returns to Gotham and becomes Batman to confront corruption and fear.', relatedTitle: 'The Dark Knight' },
  { title: 'The Dark Knight Rises', year: 2012, genre: ['Action', 'Crime', 'Drama'], director: 'Christopher Nolan', leadCast: ['Christian Bale', 'Tom Hardy'], rating: 8.4, synopsis: 'A reclusive Batman returns when Bane threatens Gotham in a citywide siege.', relatedTitle: 'The Dark Knight' },
  { title: 'Pulp Fiction', year: 1994, genre: ['Crime', 'Drama'], director: 'Quentin Tarantino', leadCast: ['John Travolta', 'Samuel L. Jackson'], rating: 8.9, synopsis: 'Interwoven crime stories in Los Angeles collide through chance, consequence, and dark humor.', relatedTitle: null },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, genre: ['Adventure', 'Drama', 'Fantasy'], director: 'Peter Jackson', leadCast: ['Elijah Wood', 'Ian McKellen'], rating: 8.9, synopsis: 'A young hobbit begins a perilous quest to destroy a ring of immense evil.', relatedTitle: 'The Lord of the Rings: The Two Towers' },
  { title: 'The Lord of the Rings: The Two Towers', year: 2002, genre: ['Adventure', 'Drama', 'Fantasy'], director: 'Peter Jackson', leadCast: ['Elijah Wood', 'Viggo Mortensen'], rating: 8.8, synopsis: 'The fellowship divided, alliances are tested as war gathers around Middle-earth.', relatedTitle: 'The Lord of the Rings: The Return of the King' },
  { title: 'The Lord of the Rings: The Return of the King', year: 2003, genre: ['Adventure', 'Drama', 'Fantasy'], director: 'Peter Jackson', leadCast: ['Elijah Wood', 'Viggo Mortensen'], rating: 9.0, synopsis: 'The final confrontation for Middle-earth unfolds while Frodo nears Mount Doom.', relatedTitle: 'The Lord of the Rings: The Two Towers' },
  { title: 'Fight Club', year: 1999, genre: ['Drama'], director: 'David Fincher', leadCast: ['Brad Pitt', 'Edward Norton'], rating: 8.8, synopsis: 'An office worker and a charismatic stranger start an underground movement with dangerous consequences.', relatedTitle: null },
  { title: 'Forrest Gump', year: 1994, genre: ['Drama', 'Romance'], director: 'Robert Zemeckis', leadCast: ['Tom Hanks', 'Robin Wright'], rating: 8.8, synopsis: 'A simple, kind-hearted man unexpectedly witnesses and influences key moments in modern American history.', relatedTitle: null },
  { title: 'Inception', year: 2010, genre: ['Action', 'Adventure', 'Sci-Fi'], director: 'Christopher Nolan', leadCast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'], rating: 8.8, synopsis: 'A thief who steals secrets through dream-sharing is offered a chance at redemption through inception.', relatedTitle: null },
  { title: 'Interstellar', year: 2014, genre: ['Adventure', 'Drama', 'Sci-Fi'], director: 'Christopher Nolan', leadCast: ['Matthew McConaughey', 'Anne Hathaway'], rating: 8.7, synopsis: 'Explorers travel through a wormhole to secure humanitys future as Earth becomes uninhabitable.', relatedTitle: null },
  { title: 'The Matrix', year: 1999, genre: ['Action', 'Sci-Fi'], director: 'The Wachowskis', leadCast: ['Keanu Reeves', 'Laurence Fishburne'], rating: 8.7, synopsis: 'A hacker discovers reality is a simulation and joins a rebellion against intelligent machines.', relatedTitle: 'The Matrix Reloaded' },
  { title: 'The Matrix Reloaded', year: 2003, genre: ['Action', 'Sci-Fi'], director: 'The Wachowskis', leadCast: ['Keanu Reeves', 'Carrie-Anne Moss'], rating: 7.2, synopsis: 'Neo and allies race against time as war intensifies between Zion and the machines.', relatedTitle: 'The Matrix Revolutions' },
  { title: 'The Matrix Revolutions', year: 2003, genre: ['Action', 'Sci-Fi'], director: 'The Wachowskis', leadCast: ['Keanu Reeves', 'Hugo Weaving'], rating: 6.7, synopsis: 'The battle for humanity reaches its climax as Neo confronts Agent Smith.', relatedTitle: 'The Matrix Reloaded' },
  { title: 'Se7en', year: 1995, genre: ['Crime', 'Drama', 'Mystery'], director: 'David Fincher', leadCast: ['Brad Pitt', 'Morgan Freeman'], rating: 8.6, synopsis: 'Two detectives track a serial killer who stages murders around the seven deadly sins.', relatedTitle: null },
  { title: 'The Silence of the Lambs', year: 1991, genre: ['Crime', 'Drama', 'Thriller'], director: 'Jonathan Demme', leadCast: ['Jodie Foster', 'Anthony Hopkins'], rating: 8.6, synopsis: 'An FBI trainee seeks help from a brilliant imprisoned cannibal to catch another killer.', relatedTitle: null },
  { title: 'The Green Mile', year: 1999, genre: ['Crime', 'Drama', 'Fantasy'], director: 'Frank Darabont', leadCast: ['Tom Hanks', 'Michael Clarke Duncan'], rating: 8.6, synopsis: 'A death row guard witnesses miracles that challenge justice and human cruelty.', relatedTitle: null },
  { title: 'Saving Private Ryan', year: 1998, genre: ['Drama', 'War'], director: 'Steven Spielberg', leadCast: ['Tom Hanks', 'Matt Damon'], rating: 8.6, synopsis: 'A squad deep behind enemy lines searches for a soldier whose brothers were killed in combat.', relatedTitle: null },
  { title: 'Gladiator', year: 2000, genre: ['Action', 'Adventure', 'Drama'], director: 'Ridley Scott', leadCast: ['Russell Crowe', 'Joaquin Phoenix'], rating: 8.5, synopsis: 'A betrayed Roman general rises as a gladiator to seek justice against a corrupt emperor.', relatedTitle: 'Gladiator II' },
  { title: 'Gladiator II', year: 2024, genre: ['Action', 'Adventure', 'Drama'], director: 'Ridley Scott', leadCast: ['Paul Mescal', 'Denzel Washington'], rating: 7.0, synopsis: 'A new hero enters the Colosseum amid political unrest and imperial ambition.', relatedTitle: 'Gladiator' },
  { title: 'Whiplash', year: 2014, genre: ['Drama', 'Music'], director: 'Damien Chazelle', leadCast: ['Miles Teller', 'J.K. Simmons'], rating: 8.5, synopsis: 'A driven jazz drummer clashes with an elite instructor whose methods push him to the edge.', relatedTitle: null },
  { title: 'Parasite', year: 2019, genre: ['Drama', 'Thriller'], director: 'Bong Joon Ho', leadCast: ['Song Kang-ho', 'Lee Sun-kyun'], rating: 8.5, synopsis: 'A poor family infiltrates a wealthy household, triggering an escalating chain of deception and violence.', relatedTitle: null },
  { title: 'Joker', year: 2019, genre: ['Crime', 'Drama', 'Thriller'], director: 'Todd Phillips', leadCast: ['Joaquin Phoenix', 'Robert De Niro'], rating: 8.4, synopsis: 'A struggling comedian descends into chaos and reinvents himself in a fractured Gotham.', relatedTitle: null },
  { title: 'Dune', year: 2021, genre: ['Action', 'Adventure', 'Sci-Fi'], director: 'Denis Villeneuve', leadCast: ['Timothee Chalamet', 'Rebecca Ferguson'], rating: 8.0, synopsis: 'A noble heir navigates prophecy, politics, and survival on the most dangerous planet in the galaxy.', relatedTitle: 'Dune: Part Two' },
  { title: 'Dune: Part Two', year: 2024, genre: ['Action', 'Adventure', 'Sci-Fi'], director: 'Denis Villeneuve', leadCast: ['Timothee Chalamet', 'Zendaya'], rating: 8.6, synopsis: 'Paul Atreides joins the Fremen and leads a revolt that will reshape the balance of power.', relatedTitle: 'Dune' },
  { title: 'Oppenheimer', year: 2023, genre: ['Biography', 'Drama', 'History'], director: 'Christopher Nolan', leadCast: ['Cillian Murphy', 'Emily Blunt'], rating: 8.4, synopsis: 'The physicist behind the atomic bomb grapples with ambition, morality, and global consequence.', relatedTitle: null },
  { title: 'The Prestige', year: 2006, genre: ['Drama', 'Mystery', 'Sci-Fi'], director: 'Christopher Nolan', leadCast: ['Hugh Jackman', 'Christian Bale'], rating: 8.5, synopsis: 'Two rival magicians wage an obsession-fueled war that blurs illusion and sacrifice.', relatedTitle: null },
  { title: 'The Departed', year: 2006, genre: ['Crime', 'Drama', 'Thriller'], director: 'Martin Scorsese', leadCast: ['Leonardo DiCaprio', 'Matt Damon'], rating: 8.5, synopsis: 'An undercover cop and a mob mole race to expose each other in a deadly game of deception.', relatedTitle: null },
  { title: 'The Wolf of Wall Street', year: 2013, genre: ['Biography', 'Comedy', 'Crime'], director: 'Martin Scorsese', leadCast: ['Leonardo DiCaprio', 'Jonah Hill'], rating: 8.2, synopsis: 'A stockbroker rises on greed and fraud while his empire spirals toward collapse.', relatedTitle: null },
  { title: 'Mad Max: Fury Road', year: 2015, genre: ['Action', 'Adventure', 'Sci-Fi'], director: 'George Miller', leadCast: ['Tom Hardy', 'Charlize Theron'], rating: 8.1, synopsis: 'In a wasteland ruled by tyranny, fugitives launch a relentless escape across the desert.', relatedTitle: 'Furiosa: A Mad Max Saga' },
  { title: 'Furiosa: A Mad Max Saga', year: 2024, genre: ['Action', 'Adventure', 'Sci-Fi'], director: 'George Miller', leadCast: ['Anya Taylor-Joy', 'Chris Hemsworth'], rating: 7.6, synopsis: 'A fierce survivor fights through a brutal wasteland to reclaim her freedom.', relatedTitle: 'Mad Max: Fury Road' },
  { title: 'Avengers: Endgame', year: 2019, genre: ['Action', 'Adventure', 'Sci-Fi'], director: 'Anthony Russo', leadCast: ['Robert Downey Jr.', 'Chris Evans'], rating: 8.4, synopsis: 'The Avengers regroup for one final mission to reverse universal devastation.', relatedTitle: 'Avengers: Infinity War' },
  { title: 'Avengers: Infinity War', year: 2018, genre: ['Action', 'Adventure', 'Sci-Fi'], director: 'Anthony Russo', leadCast: ['Robert Downey Jr.', 'Chris Hemsworth'], rating: 8.4, synopsis: 'The Avengers and allies face Thanos before he can collect all six Infinity Stones.', relatedTitle: 'Avengers: Endgame' },
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018, genre: ['Animation', 'Action', 'Adventure'], director: 'Bob Persichetti', leadCast: ['Shameik Moore', 'Jake Johnson'], rating: 8.4, synopsis: 'Miles Morales discovers a multiverse of Spider-heroes and learns what it means to wear the mask.', relatedTitle: 'Spider-Man: Across the Spider-Verse' },
  { title: 'Spider-Man: Across the Spider-Verse', year: 2023, genre: ['Animation', 'Action', 'Adventure'], director: 'Joaquim Dos Santos', leadCast: ['Shameik Moore', 'Hailee Steinfeld'], rating: 8.6, synopsis: 'Miles is drawn into a larger multiverse conflict where every Spider-hero must choose a side.', relatedTitle: 'Spider-Man: Into the Spider-Verse' },
  { title: 'Alien', year: 1979, genre: ['Horror', 'Sci-Fi'], director: 'Ridley Scott', leadCast: ['Sigourney Weaver', 'Tom Skerritt'], rating: 8.5, synopsis: 'A commercial spaceship crew is hunted by a lethal alien organism in deep space.', relatedTitle: 'Aliens' },
  { title: 'Aliens', year: 1986, genre: ['Action', 'Adventure', 'Sci-Fi'], director: 'James Cameron', leadCast: ['Sigourney Weaver', 'Michael Biehn'], rating: 8.4, synopsis: 'Ripley returns with colonial marines to confront a terrifying alien hive.', relatedTitle: 'Alien' },
  { title: 'Blade Runner 2049', year: 2017, genre: ['Drama', 'Mystery', 'Sci-Fi'], director: 'Denis Villeneuve', leadCast: ['Ryan Gosling', 'Harrison Ford'], rating: 8.0, synopsis: 'A blade runner uncovers a secret that could destabilize society and the future of humanity.', relatedTitle: 'Blade Runner' },
  { title: 'Blade Runner', year: 1982, genre: ['Sci-Fi', 'Thriller'], director: 'Ridley Scott', leadCast: ['Harrison Ford', 'Rutger Hauer'], rating: 8.1, synopsis: 'A former cop is tasked with hunting synthetic humans in a rain-soaked dystopian Los Angeles.', relatedTitle: 'Blade Runner 2049' },
  { title: 'No Country for Old Men', year: 2007, genre: ['Crime', 'Drama', 'Thriller'], director: 'Coen Brothers', leadCast: ['Tommy Lee Jones', 'Javier Bardem'], rating: 8.2, synopsis: 'After a drug deal gone wrong, a hunter finds a fortune and is pursued by a relentless killer.', relatedTitle: null },
  { title: 'The Social Network', year: 2010, genre: ['Biography', 'Drama'], director: 'David Fincher', leadCast: ['Jesse Eisenberg', 'Andrew Garfield'], rating: 7.8, synopsis: 'The rise of Facebook unfolds through ambition, betrayal, and legal battles.', relatedTitle: null },
  { title: 'La La Land', year: 2016, genre: ['Comedy', 'Drama', 'Music'], director: 'Damien Chazelle', leadCast: ['Ryan Gosling', 'Emma Stone'], rating: 8.0, synopsis: 'A musician and an aspiring actor chase dreams and love in modern Los Angeles.', relatedTitle: null },
  { title: '1917', year: 2019, genre: ['Drama', 'War'], director: 'Sam Mendes', leadCast: ['George MacKay', 'Dean-Charles Chapman'], rating: 8.2, synopsis: 'Two soldiers undertake a near-impossible mission across enemy territory during World War I.', relatedTitle: null },
  { title: 'The Batman', year: 2022, genre: ['Action', 'Crime', 'Drama'], director: 'Matt Reeves', leadCast: ['Robert Pattinson', 'Zoe Kravitz'], rating: 7.8, synopsis: 'In his second year as Gotham vigilante, Batman uncovers a conspiracy tied to the citys political elite.', relatedTitle: null },
  { title: 'The Holdovers', year: 2023, genre: ['Comedy', 'Drama'], director: 'Alexander Payne', leadCast: ['Paul Giamatti', 'Da Vine Joy Randolph'], rating: 8.0, synopsis: 'A strict teacher, a grieving cook, and a stranded student form an unexpected bond over a lonely winter break.', relatedTitle: null },
  { title: 'Poor Things', year: 2023, genre: ['Comedy', 'Drama', 'Sci-Fi'], director: 'Yorgos Lanthimos', leadCast: ['Emma Stone', 'Mark Ruffalo'], rating: 7.8, synopsis: 'A young woman brought back to life embarks on a radical journey of self-discovery and social rebellion.', relatedTitle: null },
  { title: 'The Substance', year: 2024, genre: ['Drama', 'Horror', 'Sci-Fi'], director: 'Coralie Fargeat', leadCast: ['Demi Moore', 'Margaret Qualley'], rating: 7.6, synopsis: 'A fading star experiments with a black-market treatment promising youth, leading to terrifying consequences.', relatedTitle: null },
  { title: 'Civil War', year: 2024, genre: ['Action', 'Drama', 'Thriller'], director: 'Alex Garland', leadCast: ['Kirsten Dunst', 'Cailee Spaeny'], rating: 7.2, synopsis: 'Journalists travel across a fractured United States to document conflict before the capital falls.', relatedTitle: null },
  { title: 'Past Lives', year: 2023, genre: ['Drama', 'Romance'], director: 'Celine Song', leadCast: ['Greta Lee', 'Teo Yoo'], rating: 7.9, synopsis: 'Childhood friends reconnect decades later and confront how time, identity, and migration shaped their lives.', relatedTitle: null },
  { title: 'Godzilla Minus One', year: 2023, genre: ['Action', 'Drama', 'Sci-Fi'], director: 'Takashi Yamazaki', leadCast: ['Ryunosuke Kamiki', 'Minami Hamabe'], rating: 8.2, synopsis: 'Postwar Japan faces a catastrophic new threat as survivors struggle with guilt, duty, and rebuilding.', relatedTitle: null },
  { title: 'Anatomy of a Fall', year: 2023, genre: ['Crime', 'Drama', 'Thriller'], director: 'Justine Triet', leadCast: ['Sandra Huller', 'Swann Arlaud'], rating: 7.8, synopsis: 'A writer is put on trial after her husbands death, and the courtroom dissects truth, marriage, and perception.', relatedTitle: null }
]

const extendedTitles = [
  'The Pianist', 'The Lion King', 'The Usual Suspects', 'Schindlers List', 'Goodfellas',
  'City of God', 'The Intouchables', 'The Great Dictator', 'Modern Times', 'Casablanca',
  'Cinema Paradiso', 'The Lives of Others', 'Memento', 'The Shining', 'Django Unchained',
  'Inglourious Basterds', 'Reservoir Dogs', 'A Beautiful Mind', 'The Truman Show',
  'Eternal Sunshine of the Spotless Mind', 'Heat', 'Prisoners', 'Shutter Island', 'Gone Girl',
  'The Revenant', 'The Grand Budapest Hotel', 'Moonlight', 'Arrival', 'Sicario', 'Children of Men',
  'Her', 'Drive', 'Ford v Ferrari', 'Knives Out', 'The Irishman', 'Catch Me If You Can',
  'The Curious Case of Benjamin Button', 'Kill Bill: Vol. 1', 'Kill Bill: Vol. 2', 'The Hateful Eight',
  'The Handmaiden', 'Memories of Murder', 'Oldboy', 'Pan s Labyrinth', 'The Hunt', 'Another Round',
  'The Imitation Game', 'Argo', 'Spotlight', 'There Will Be Blood', 'Phantom Thread', 'Little Women',
  'The Big Short', 'Moneyball', 'Nightcrawler', 'Sound of Metal', 'Everything Everywhere All at Once',
  'The Banshees of Inisherin', 'Top Gun: Maverick', 'Mission: Impossible - Fallout', 'Skyfall',
  'Casino Royale', 'Logan', 'X-Men: Days of Future Past', 'Guardians of the Galaxy', 'Black Panther',
  'Iron Man', 'Captain America: The Winter Soldier', 'Doctor Strange', 'Rogue One: A Star Wars Story'
]

const directorPool = [
  'Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese', 'Denis Villeneuve', 'Ridley Scott',
  'Quentin Tarantino', 'David Fincher', 'Greta Gerwig', 'Bong Joon Ho', 'Damien Chazelle'
]

const castPool = [
  ['Leonardo DiCaprio', 'Cate Blanchett'], ['Ryan Gosling', 'Amy Adams'],
  ['Matt Damon', 'Jessica Chastain'], ['Christian Bale', 'Rebecca Ferguson'],
  ['Scarlett Johansson', 'Michael Fassbender'], ['Jake Gyllenhaal', 'Viola Davis'],
  ['Denzel Washington', 'Florence Pugh'], ['Tom Hardy', 'Emily Blunt'],
  ['Adam Driver', 'Saoirse Ronan'], ['Oscar Isaac', 'Anya Taylor-Joy']
]

const genrePool = [
  ['Drama', 'Thriller'], ['Crime', 'Drama'], ['Action', 'Adventure'],
  ['Sci-Fi', 'Drama'], ['Mystery', 'Thriller'], ['Biography', 'Drama'], ['Comedy', 'Drama']
]

const inferGenres = (title, index) => {
  const lower = title.toLowerCase()
  if (lower.includes('star wars') || lower.includes('dune') || lower.includes('blade runner')) return ['Sci-Fi', 'Adventure']
  if (lower.includes('mission') || lower.includes('top gun') || lower.includes('fallout')) return ['Action', 'Adventure']
  if (lower.includes('kill bill') || lower.includes('django')) return ['Action', 'Crime']
  return genrePool[index % genrePool.length]
}

const extendedMovies = extendedTitles.map((title, index) => ({
  title,
  year: 1980 + (index * 3) % 45,
  rating: Number((7.4 + ((index % 21) * 0.09)).toFixed(1)),
  director: directorPool[index % directorPool.length],
  leadCast: castPool[index % castPool.length],
  genre: inferGenres(title, index),
  synopsis: `${title} delivers a polished ${inferGenres(title, index).join('/')} story with strong performances and high-stakes emotional payoff.`,
  relatedTitle: null
}))

const posterOverrides = {
  'The Shawshank Redemption': 'https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg',
  'The Godfather': 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg',
  'The Godfather Part II': 'https://upload.wikimedia.org/wikipedia/en/0/03/Godfather_part_ii.jpg',
  'The Dark Knight': 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg',
  'Batman Begins': 'https://upload.wikimedia.org/wikipedia/en/a/af/Batman_Begins_Poster.jpg',
  'The Dark Knight Rises': 'https://upload.wikimedia.org/wikipedia/en/8/83/Dark_knight_rises_poster.jpg',
  'Pulp Fiction': 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg',
  'The Lord of the Rings: The Fellowship of the Ring': 'https://upload.wikimedia.org/wikipedia/en/f/fb/Lord_Rings_Fellowship_Ring.jpg',
  'The Lord of the Rings: The Two Towers': 'https://upload.wikimedia.org/wikipedia/en/a/a1/Lord_Rings_Two_Towers.jpg',
  'The Lord of the Rings: The Return of the King': 'https://upload.wikimedia.org/wikipedia/en/4/48/Lord_Rings_Return_King.jpg',
  'Fight Club': 'https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg',
  'Forrest Gump': 'https://upload.wikimedia.org/wikipedia/en/6/67/Forrest_Gump_poster.jpg',
  Inception: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg',
  Interstellar: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
  'The Matrix': 'https://upload.wikimedia.org/wikipedia/en/d/db/The_Matrix.png',
  'The Matrix Reloaded': 'https://upload.wikimedia.org/wikipedia/en/b/ba/Poster_-_The_Matrix_Reloaded.jpg',
  'The Matrix Revolutions': 'https://upload.wikimedia.org/wikipedia/en/7/7b/The-matrix-revolutions_oxlati6t.png',
  Se7en: 'https://upload.wikimedia.org/wikipedia/en/6/68/Seven_%28movie%29_poster.jpg',
  'The Silence of the Lambs': 'https://upload.wikimedia.org/wikipedia/en/8/86/The_Silence_of_the_Lambs_poster.jpg',
  'The Green Mile': 'https://upload.wikimedia.org/wikipedia/en/e/e2/The_Green_Mile_%28movie_poster%29.jpg',
  'Saving Private Ryan': 'https://upload.wikimedia.org/wikipedia/en/a/ac/Saving_Private_Ryan_poster.jpg',
  Gladiator: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Gladiator_%282000_film_poster%29.png',
  Whiplash: 'https://upload.wikimedia.org/wikipedia/en/0/01/Whiplash_poster.jpg',
  Parasite: 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png',
  Joker: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg',
  Dune: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg',
  'Dune: Part Two': 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg',
  Oppenheimer: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg',
  'The Prestige': 'https://upload.wikimedia.org/wikipedia/en/d/d2/Prestige_poster.jpg',
  'The Departed': 'https://upload.wikimedia.org/wikipedia/en/5/50/Departed234.jpg',
  'The Wolf of Wall Street': 'https://upload.wikimedia.org/wikipedia/en/d/d8/The_Wolf_of_Wall_Street_%282013%29.png',
  'Mad Max: Fury Road': 'https://upload.wikimedia.org/wikipedia/en/6/6e/Mad_Max_Fury_Road.jpg',
  'Furiosa: A Mad Max Saga': 'https://upload.wikimedia.org/wikipedia/en/3/34/Furiosa_A_Mad_Max_Saga.jpg',
  'Avengers: Endgame': 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
  'Avengers: Infinity War': 'https://upload.wikimedia.org/wikipedia/en/4/4d/Avengers_Infinity_War_poster.jpg',
  'The Batman': 'https://upload.wikimedia.org/wikipedia/en/8/8a/The_Batman_%28film%29_poster.jpg',
  'The Holdovers': 'https://upload.wikimedia.org/wikipedia/en/9/9f/The_Holdovers_film_poster.jpg',
  'Poor Things': 'https://upload.wikimedia.org/wikipedia/en/5/58/Poor_Things_lantern_poster.jpg',
  'The Substance': 'https://upload.wikimedia.org/wikipedia/en/f/f1/The_Substance_2024_film_poster.jpg',
  'Civil War': 'https://upload.wikimedia.org/wikipedia/en/1/1b/Civil_War_%282024_film%29_poster.jpg',
  'Past Lives': 'https://upload.wikimedia.org/wikipedia/en/a/a3/Past_Lives_film_poster.jpg',
  'Godzilla Minus One': 'https://upload.wikimedia.org/wikipedia/en/5/52/Godzilla_Minus_One_poster.jpg',
  'Anatomy of a Fall': 'https://upload.wikimedia.org/wikipedia/en/4/47/Anatomy_of_a_Fall_film_poster.jpg'
}

const allMoviesRaw = [...coreMovies, ...extendedMovies].map((movie, index) => {
  const safeTitle = movie.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  return {
    id: index + 1,
    title: movie.title, genre: movie.genre, director: movie.director,
    leadCast: movie.leadCast, rating: movie.rating, year: movie.year, synopsis: movie.synopsis,
    posterUrl: posterOverrides[movie.title] || `https://picsum.photos/seed/flixmate-${safeTitle}/420/620`,
    trailerLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} official trailer`)}`,
    relatedTitle: movie.relatedTitle
  }
})

const titleToId = Object.fromEntries(allMoviesRaw.map((movie) => [movie.title, movie.id]))

const movies = allMoviesRaw.map((movie) => ({
  id: movie.id, title: movie.title, genre: movie.genre, director: movie.director,
  leadCast: movie.leadCast, rating: movie.rating, year: movie.year, synopsis: movie.synopsis,
  posterUrl: movie.posterUrl, trailerLink: movie.trailerLink,
  relatedPrequelSequelId: movie.relatedTitle ? titleToId[movie.relatedTitle] || null : null
}))

export default movies
