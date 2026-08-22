import fs from "fs";
import path from "path";
import { Movie, TVSeries, Season, Episode, MovieCollection, SubtitleFile, SiteSettings, ContactMessage, MovieImage } from "../src/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface DatabaseSchema {
  movies: Movie[];
  movieImages: MovieImage[];
  tvSeries: TVSeries[];
  seasons: Season[];
  episodes: Episode[];
  collections: MovieCollection[];
  subtitles: SubtitleFile[];
  settings: SiteSettings;
  contactMessages: ContactMessage[];
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "SeriesHubLk",
  siteLogoUrl: "/logo.png",
  siteCoverUrl: "/assets/cover.png",
  contactEmail: "info@serieshub.lk",
  contactPhone: "+94 77 123 4567",
  telegramUrl: "https://t.me/SeriesHubLk",
  facebookUrl: "https://facebook.com/SeriesHubLk",
  youtubeUrl: "https://youtube.com/@SeriesHubLk",
  tmdbApiKey: "4a1a05db269fb2395c9b055504a95439",
  defaultSeoTitle: "SeriesHubLk — සිංහල උපසිරැසි සමඟ චිත්‍රපට සහ ටීවී සීරීස්",
  defaultSeoDescription: "ලොව ජනප්‍රිය චිත්‍රපට සහ TV Series සිංහල උපසිරැසි සහිතව 1080p Video Quality සමඟ බාගත කිරීමට සහ නැරඹීමට ඇති විශිෂ්ටතම වෙබ් අඩවිය.",
  heroHeading: "ලොව ජනප්‍රිය TV Series & චිත්‍රපට නිවහන",
  heroSubheading: "",
  noticeBanner: "🎉 SeriesHubLk වෙත සාදරයෙන් පිළිගනිමු! සියලුම චිත්‍රපට සහ ටීවී සීරීස් සඳහා උසස් තත්ත්වයේ සිංහල උපසිරැසි නොමිලේ ලබාගත හැක.",
};

const DEFAULT_COLLECTIONS: MovieCollection[] = [
  {
    id: "col-avengers",
    slug: "avengers-saga",
    name: "Avengers Saga",
    nameSi: "ඇවෙන්ජර්ස් සිනමා එකතුව",
    description: "The complete Avengers epic journey from Earth's Mightiest Heroes assembling to the ultimate Endgame battle against Thanos.",
    coverImage: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    movieIds: ["m-avengers-1", "m-avengers-2", "m-avengers-3", "m-avengers-4"],
    isFeatured: true,
  },
  {
    id: "col-mcu",
    slug: "marvel-cinematic-universe",
    name: "Marvel Cinematic Universe",
    nameSi: "මාර්වල් සිනමා විශ්වය",
    description: "Marvel Studios' groundbreaking interconnected superhero universe featuring Iron Man, Captain America, Thor, and more.",
    coverImage: "https://image.tmdb.org/t/p/w1280/lmZFxXgJE3vgr8zqvgFuZAdDXap.jpg",
    movieIds: ["m-avengers-1", "m-avengers-2", "m-avengers-3", "m-avengers-4"],
    isFeatured: true,
  },
  {
    id: "col-dc",
    slug: "dc-extended-universe",
    name: "DC Extended Universe",
    nameSi: "ඩීසී සුපිරි වීර එකතුව",
    description: "Dark, epic adventures from DC Comics featuring Batman, Superman, Wonder Woman, and the Justice League.",
    coverImage: "https://image.tmdb.org/t/p/w1280/jhi3K0rN46SS29Yeg9iuYHGUCcW.jpg",
    movieIds: [],
    isFeatured: true,
  },
  {
    id: "col-harry-potter",
    slug: "harry-potter-collection",
    name: "Harry Potter Wizarding World",
    nameSi: "හැරී පොටර් මායා ලෝකය",
    description: "Relive the magic of Hogwarts with the complete 8-film Harry Potter saga.",
    coverImage: "https://image.tmdb.org/t/p/w1280/5rrGVmRUmiKOliOz3DY9q0hyxum.jpg",
    movieIds: [],
    isFeatured: false,
  },
];

// Initial 4 Sample Avengers Movies from IMDb specification
const DEFAULT_MOVIES: Movie[] = [
  {
    id: "m-avengers-1",
    slug: "the-avengers-2012",
    imdbId: "tt0848228",
    tmdbId: 24428,
    title: "The Avengers",
    originalTitle: "The Avengers",
    year: 2012,
    releaseDate: "2012-04-25",
    runtime: 143,
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 8.0,
    overview: "When an unexpected enemy emerges and threatens global safety and security, Nick Fury, director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster.",
    sinhalaDescription: "මාර්වල් සිනමා විශ්වයේ (MCU) පළමු අදියරේ කූටප්‍රාප්තිය සනිටුහන් කරමින් 2012 වසරේ තිරගත වූ 'The Avengers' යනු ලොව පුරා සිනමාලෝලීන් මහත් උනන්දුවෙන් වැළඳගත් සුපිරි සිනමා නිර්මාණයකි. ලෝක සාමයට සහ ආරක්ෂාවට ලොකී (Loki) ඇතුළු පිටසක්වල බලවේගයකින් එල්ලවන ප්‍රබල තර්ජනය හමුවේ S.H.I.E.L.D. සංවිධානයේ ප්‍රධානී නික් ෆියුරි විසින් පෘථිවියේ ප්‍රබලතම සුපිරි වීරයන් වන අයන් මෑන්, කැප්ටන් ඇමරිකා, තෝර්, හල්ක්, බ්ලැක් විඩෝ සහ හෝක්අයි එක්රැස් කරයි.\n\nඑකිනෙකාට වෙනස් ගතිගුණ සහ අදහස් ඇති මෙම වීරයන් එකමුතු වී නිව්යෝර්ක් නගරය සුරැකීමට දරන අසමසම සටන කුතුහලය සහ ක්‍රියාදාම රැසකින් යුක්තව මෙහි දිගහැරේ. Joss Whedon ගේ විශිෂ්ට අධ්‍යක්ෂණයෙන් හැඩවුණු මෙම චිත්‍රපටය ඔබ නැරඹිය යුතුම අතිදැවැන්ත සිනමා අත්දැකීමකි. සිංහල උපසිරැසි සමඟ දැන්ම නරඹන්න!",
    posterUrl: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=eOrNdBpGMv8",
    director: "Joss Whedon",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson", "Jeremy Renner", "Tom Hiddleston", "Samuel L. Jackson"],
    country: "United States",
    language: "English",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    hasSinhalaSub: true,
    published: true,
    featured: true,
    collections: ["col-avengers", "col-mcu"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-avengers-2",
    slug: "avengers-age-of-ultron-2015",
    imdbId: "tt2395427",
    tmdbId: 99861,
    title: "Avengers: Age of Ultron",
    originalTitle: "Avengers: Age of Ultron",
    year: 2015,
    releaseDate: "2015-04-22",
    runtime: 141,
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 7.3,
    overview: "When Tony Stark tries to jumpstart a dormant peacekeeping program, things go awry and Earth's Mightiest Heroes are put to the ultimate test as the fate of the planet hangs in the balance as the villainous Ultron emerges.",
    sinhalaDescription: "මාර්වල් සිනමා විශ්වයේ (MCU) දෙවන අදියරේ දැවැන්ත සන්ධිස්ථානයක් සනිටුහන් කළ 'Avengers: Age of Ultron' චිත්‍රපටය 2015 වසරේදී තිරගත විය. ටෝනි ස්ටාර්ක් (Iron Man) සහ බෲස් බැනර් (Hulk) එක්ව ලෝක සාමය රැකගැනීමේ අරමුණින් නිර්මාණය කරන කෘත්‍රිම බුද්ධියක් (AI) වන 'අල්ට්‍රොන්' (Ultron) අනපේක්ෂිත ලෙස මිනිස් වර්ගයාම විනාශ කිරීමට තීරණය කිරීමත් සමඟ ලෝකය මහත් අනතුරකට පත්වේ.\n\nඇවෙන්ජර්ස් වීරයන්ට අල්ට්‍රොන්ගේ ඝාතක රොබෝ හමුදාවට එරෙහිව සටන් කිරීමට අමතරව ස්කාර්ලට් විච් (Wanda) සහ ක්වික්සිල්වර් (Pietro) වැනි නව චරිතවල අභියෝගවලට ද මුහුණ දීමට සිදුවේ. ඇදහිය නොහැකි දෘශ්‍ය ප්‍රයෝග, උද්වේගකර සටන් ජවනිකා සහ Vision චරිතයේ සම්ප්‍රාප්තිය සමඟින් මෙම සිනමාපටය ඔබේ හදවත දිනාගනු ඇත.",
    posterUrl: "https://image.tmdb.org/t/p/w500/4ssDuvEDkS9urvtLgi1STazoDc8.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/8K9qN9nE43s22I9g24p4f95o0m7.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=tmeOjFno6Do",
    director: "Joss Whedon",
    cast: ["Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo", "Chris Evans", "Scarlett Johansson", "Jeremy Renner", "James Spader", "Elizabeth Olsen"],
    country: "United States",
    language: "English",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    hasSinhalaSub: true,
    published: true,
    featured: true,
    collections: ["col-avengers", "col-mcu"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-avengers-3",
    slug: "avengers-infinity-war-2018",
    imdbId: "tt4154756",
    tmdbId: 299536,
    title: "Avengers: Infinity War",
    originalTitle: "Avengers: Infinity War",
    year: 2018,
    releaseDate: "2018-04-25",
    runtime: 149,
    genres: ["Action", "Adventure", "Sci-Fi", "Fantasy"],
    rating: 8.4,
    overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.",
    sinhalaDescription: "සිනමා ඉතිහාසයේ එදා මෙදා තුර බිහිවූ අතිදැවැන්තම හා වඩාත්ම හැඟීම්බර ක්‍රියාදාම සිනමා නිර්මාණයක් ලෙස 'Avengers: Infinity War' අවිවාදයෙන්ම හැඳින්විය හැක. විශ්වයේ සමතුලිතතාවය ඇතිකිරීමේ නාමයෙන් විශ්වයේ අඩක් විනාශ කිරීමට අරමුණු කරගත් බලගතු තැනොස් (Thanos), අනන්ත මැණික් හය (Infinity Stones) සොයා මෙහෙයුමක් ආරම්භ කරයි.\n\nඇවෙන්ජර්ස් සාමාජිකයන්, ගාඩියන්ස් ඔෆ් ද ගැලැක්සි (Guardians of the Galaxy), ඩොක්ටර් ස්ට්‍රේන්ජ් සහ බ්ලැක් පැන්තර් ඇතුළු සියලුම වීරයන් එකම පෙරමුණකට පැමිණ තැනොස්ව නැවැත්වීමට දරන අසමසම අරගලය මෙම චිත්‍රපටයෙන් නිරූපණය වේ. නොසිතූ ආකාරයේ කම්පන සහගත අවසානයක් සහිත මෙම විශිෂ්ට සිනමාපටය සිංහල උපසිරැසි සමඟ ඉහළම ගුණාත්මකභාවයෙන් නරඹන්න.",
    posterUrl: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/lmZFxXgJE3vgr8zqvgFuZAdDXap.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=6ZfuNTqbHE8",
    director: "Anthony Russo, Joe Russo",
    cast: ["Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo", "Chris Evans", "Scarlett Johansson", "Benedict Cumberbatch", "Tom Holland", "Josh Brolin"],
    country: "United States",
    language: "English",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    hasSinhalaSub: true,
    published: true,
    featured: true,
    collections: ["col-avengers", "col-mcu"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-avengers-4",
    slug: "avengers-endgame-2019",
    imdbId: "tt4154796",
    tmdbId: 299534,
    title: "Avengers: Endgame",
    originalTitle: "Avengers: Endgame",
    year: 2019,
    releaseDate: "2019-04-24",
    runtime: 181,
    genres: ["Action", "Adventure", "Sci-Fi", "Drama"],
    rating: 8.4,
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    sinhalaDescription: "වසර 11 ක සිනමා ගමනක අසමසම නිමාව සනිටුහන් කරමින් ලොව පුරා සිනමා ඉතිහාසයේ ආදායම් වාර්තා බිඳහෙලූ 'Avengers: Endgame' යනු කිසිදා අමතක නොවන සිනමා මහා කාව්‍යයකි. තැනොස්ගේ 'ස්නැප්' එකෙන් පසු විශ්වයේ ජීවයෙන් අඩක් අළු වී ගිය පසු, ඉතිරි වූ ඇවෙන්ජර්ස් වීරයන් තම බිඳවැටුණු සිත් දරාගෙන කාල තරණය (Time Travel) ඔස්සේ අතීතයට ගොස් අහිමි වූවන් නැවත ලබාගැනීමට ගන්නා අන්තිම උත්සාහය මෙහි දිගහැරේ.\n\nටෝනි ස්ටාර්ක් සහ ස්ටීව් රොජර්ස් ඇතුළු සියලුම වීරයන්ගේ පරිත්‍යාගය, කඳුළු, සිනහව සහ අවසාන දැවැන්ත සටන සෑම ප්‍රේක්ෂකයෙකුගේම නෙතට කඳුළක් එක්කරයි. සම්පූර්ණ පැය තුනක් පුරා දිවෙන මෙම අසමසම සිනමා අත්දැකීම SeriesHubLk හරහා සිංහල උපසිරැසි සමඟ ඔබේ නිවසේදීම විඳගන්න!",
    posterUrl: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    director: "Anthony Russo, Joe Russo",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson", "Jeremy Renner", "Don Cheadle", "Paul Rudd"],
    country: "United States",
    language: "English",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    hasSinhalaSub: true,
    published: true,
    featured: true,
    collections: ["col-avengers", "col-mcu"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial 6 Unique Gallery Images per movie
const DEFAULT_MOVIE_IMAGES: MovieImage[] = [
  // The Avengers 2012
  { id: "img-a1-1", movieId: "m-avengers-1", imageUrl: "https://image.tmdb.org/t/p/w1280/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg", imageType: "backdrop", displayOrder: 1 },
  { id: "img-a1-2", movieId: "m-avengers-1", imageUrl: "https://image.tmdb.org/t/p/w1280/nNmJRkg8wWnRmzQDe2YwljqlCZx.jpg", imageType: "backdrop", displayOrder: 2 },
  { id: "img-a1-3", movieId: "m-avengers-1", imageUrl: "https://image.tmdb.org/t/p/w1280/7LMGIz065iB0E7bY6qZ2vF39912.jpg", imageType: "backdrop", displayOrder: 3 },
  { id: "img-a1-4", movieId: "m-avengers-1", imageUrl: "https://image.tmdb.org/t/p/w1280/hUPgIibqZlwbVzy4iqBp5c1I0l.jpg", imageType: "backdrop", displayOrder: 4 },
  { id: "img-a1-5", movieId: "m-avengers-1", imageUrl: "https://image.tmdb.org/t/p/w1280/gL2tMsnqA1h22r4u3iP3n0hO47u.jpg", imageType: "backdrop", displayOrder: 5 },
  { id: "img-a1-6", movieId: "m-avengers-1", imageUrl: "https://image.tmdb.org/t/p/w1280/h56vB8j8q7F0I7r4g3Z6yU6w5y7.jpg", imageType: "backdrop", displayOrder: 6 },

  // Age of Ultron 2015
  { id: "img-a2-1", movieId: "m-avengers-2", imageUrl: "https://image.tmdb.org/t/p/w1280/8K9qN9nE43s22I9g24p4f95o0m7.jpg", imageType: "backdrop", displayOrder: 1 },
  { id: "img-a2-2", movieId: "m-avengers-2", imageUrl: "https://image.tmdb.org/t/p/w1280/6966fI2p4Qy3V2l9gM2VvB1zJ8h.jpg", imageType: "backdrop", displayOrder: 2 },
  { id: "img-a2-3", movieId: "m-avengers-2", imageUrl: "https://image.tmdb.org/t/p/w1280/xnqustik40ogVwXzOiqH5g7U4N6.jpg", imageType: "backdrop", displayOrder: 3 },
  { id: "img-a2-4", movieId: "m-avengers-2", imageUrl: "https://image.tmdb.org/t/p/w1280/7k9M2a3h2gJ8yWqV4n4x8K5n6P7.jpg", imageType: "backdrop", displayOrder: 4 },
  { id: "img-a2-5", movieId: "m-avengers-2", imageUrl: "https://image.tmdb.org/t/p/w1280/9lU5j9n8yJ7gK4V3x6n8m5b2V1x.jpg", imageType: "backdrop", displayOrder: 5 },
  { id: "img-a2-6", movieId: "m-avengers-2", imageUrl: "https://image.tmdb.org/t/p/w1280/4zZ5t8q9W4p6Y3x2n7m5V1c8b9A.jpg", imageType: "backdrop", displayOrder: 6 },

  // Infinity War 2018
  { id: "img-a3-1", movieId: "m-avengers-3", imageUrl: "https://image.tmdb.org/t/p/w1280/lmZFxXgJE3vgr8zqvgFuZAdDXap.jpg", imageType: "backdrop", displayOrder: 1 },
  { id: "img-a3-2", movieId: "m-avengers-3", imageUrl: "https://image.tmdb.org/t/p/w1280/bOGkgRGdhrBYJSLpXaxhXVstNsV.jpg", imageType: "backdrop", displayOrder: 2 },
  { id: "img-a3-3", movieId: "m-avengers-3", imageUrl: "https://image.tmdb.org/t/p/w1280/ndlQ2Cuc3phne7Gz4Zr4GEUVETb.jpg", imageType: "backdrop", displayOrder: 3 },
  { id: "img-a3-4", movieId: "m-avengers-3", imageUrl: "https://image.tmdb.org/t/p/w1280/3P52oz9HPCSW7JQCsqCVNm5qVuc.jpg", imageType: "backdrop", displayOrder: 4 },
  { id: "img-a3-5", movieId: "m-avengers-3", imageUrl: "https://image.tmdb.org/t/p/w1280/6elXDk24vK14JbX9L37m38s9m30.jpg", imageType: "backdrop", displayOrder: 5 },
  { id: "img-a3-6", movieId: "m-avengers-3", imageUrl: "https://image.tmdb.org/t/p/w1280/9x9t6R3b7V3l6N9g2H5y0K1f4w9.jpg", imageType: "backdrop", displayOrder: 6 },

  // Endgame 2019
  { id: "img-a4-1", movieId: "m-avengers-4", imageUrl: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", imageType: "backdrop", displayOrder: 1 },
  { id: "img-a4-2", movieId: "m-avengers-4", imageUrl: "https://image.tmdb.org/t/p/w1280/orjiB3oal99aq070shzGdrpy3i7.jpg", imageType: "backdrop", displayOrder: 2 },
  { id: "img-a4-3", movieId: "m-avengers-4", imageUrl: "https://image.tmdb.org/t/p/w1280/6XJ8xKzQ2XW7L3gM8fG7H9j5m2N.jpg", imageType: "backdrop", displayOrder: 3 },
  { id: "img-a4-4", movieId: "m-avengers-4", imageUrl: "https://image.tmdb.org/t/p/w1280/5B5K5w3v2yL4x8P2m6V9N4j1k3B.jpg", imageType: "backdrop", displayOrder: 4 },
  { id: "img-a4-5", movieId: "m-avengers-4", imageUrl: "https://image.tmdb.org/t/p/w1280/3T9j7M4g9H5v2L3N1m8P7k9V4x1.jpg", imageType: "backdrop", displayOrder: 5 },
  { id: "img-a4-6", movieId: "m-avengers-4", imageUrl: "https://image.tmdb.org/t/p/w1280/8Y0v5L2m9N3v4k7P1m6X8y2V4b3.jpg", imageType: "backdrop", displayOrder: 6 },

  // Game of Thrones (tv-got) - 6 Unique Scenes
  { id: "img-got-1", movieId: "tv-got", imageUrl: "https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg", imageType: "backdrop", displayOrder: 1 },
  { id: "img-got-2", movieId: "tv-got", imageUrl: "https://image.tmdb.org/t/p/w1280/suopoADq0k8YZr4dQXcU6p0drfH.jpg", imageType: "backdrop", displayOrder: 2 },
  { id: "img-got-3", movieId: "tv-got", imageUrl: "https://image.tmdb.org/t/p/w1280/6Lw54zT5sG2YCeRtBv4Ys0ho3R6.jpg", imageType: "backdrop", displayOrder: 3 },
  { id: "img-got-4", movieId: "tv-got", imageUrl: "https://image.tmdb.org/t/p/w1280/9p3iB5t7x4xP7k9L1n6v2m4P5Q8.jpg", imageType: "backdrop", displayOrder: 4 },
  { id: "img-got-5", movieId: "tv-got", imageUrl: "https://image.tmdb.org/t/p/w1280/4fJ9VbX9w07W4G4M6bK8P8m9V4.jpg", imageType: "backdrop", displayOrder: 5 },
  { id: "img-got-6", movieId: "tv-got", imageUrl: "https://image.tmdb.org/t/p/w1280/7k9M2a3h2gJ8yWqV4n4x8K5n6P7.jpg", imageType: "backdrop", displayOrder: 6 },

  // Stranger Things (tv-stranger-things) - 6 Unique Scenes
  { id: "img-st-1", movieId: "tv-stranger-things", imageUrl: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg", imageType: "backdrop", displayOrder: 1 },
  { id: "img-st-2", movieId: "tv-stranger-things", imageUrl: "https://image.tmdb.org/t/p/w1280/2Vvd7h1vR11cZ7b1mO8v7c1o3K.jpg", imageType: "backdrop", displayOrder: 2 },
  { id: "img-st-3", movieId: "tv-stranger-things", imageUrl: "https://image.tmdb.org/t/p/w1280/wXqL1d1sO9vR6vP4n3L2k1m8O7.jpg", imageType: "backdrop", displayOrder: 3 },
  { id: "img-st-4", movieId: "tv-stranger-things", imageUrl: "https://image.tmdb.org/t/p/w1280/9lU5j9n8yJ7gK4V3x6n8m5b2V1x.jpg", imageType: "backdrop", displayOrder: 4 },
  { id: "img-st-5", movieId: "tv-stranger-things", imageUrl: "https://image.tmdb.org/t/p/w1280/4zZ5t8q9W4p6Y3x2n7m5V1c8b9A.jpg", imageType: "backdrop", displayOrder: 5 },
  { id: "img-st-6", movieId: "tv-stranger-things", imageUrl: "https://image.tmdb.org/t/p/w1280/6elXDk24vK14JbX9L37m38s9m30.jpg", imageType: "backdrop", displayOrder: 6 },

  // Breaking Bad (tv-breaking-bad) - 6 Unique Scenes
  { id: "img-bb-1", movieId: "tv-breaking-bad", imageUrl: "https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg", imageType: "backdrop", displayOrder: 1 },
  { id: "img-bb-2", movieId: "tv-breaking-bad", imageUrl: "https://image.tmdb.org/t/p/w1280/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg", imageType: "backdrop", displayOrder: 2 },
  { id: "img-bb-3", movieId: "tv-breaking-bad", imageUrl: "https://image.tmdb.org/t/p/w1280/nNmJRkg8wWnRmzQDe2YwljqlCZx.jpg", imageType: "backdrop", displayOrder: 3 },
  { id: "img-bb-4", movieId: "tv-breaking-bad", imageUrl: "https://image.tmdb.org/t/p/w1280/7LMGIz065iB0E7bY6qZ2vF39912.jpg", imageType: "backdrop", displayOrder: 4 },
  { id: "img-bb-5", movieId: "tv-breaking-bad", imageUrl: "https://image.tmdb.org/t/p/w1280/hUPgIibqZlwbVzy4iqBp5c1I0l.jpg", imageType: "backdrop", displayOrder: 5 },
  { id: "img-bb-6", movieId: "tv-breaking-bad", imageUrl: "https://image.tmdb.org/t/p/w1280/gL2tMsnqA1h22r4u3iP3n0hO47u.jpg", imageType: "backdrop", displayOrder: 6 },

  // Wednesday (tv-wednesday) - 6 Unique Scenes
  { id: "img-wed-1", movieId: "tv-wednesday", imageUrl: "https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg", imageType: "backdrop", displayOrder: 1 },
  { id: "img-wed-2", movieId: "tv-wednesday", imageUrl: "https://image.tmdb.org/t/p/w1280/8K9qN9nE43s22I9g24p4f95o0m7.jpg", imageType: "backdrop", displayOrder: 2 },
  { id: "img-wed-3", movieId: "tv-wednesday", imageUrl: "https://image.tmdb.org/t/p/w1280/6966fI2p4Qy3V2l9gM2VvB1zJ8h.jpg", imageType: "backdrop", displayOrder: 3 },
  { id: "img-wed-4", movieId: "tv-wednesday", imageUrl: "https://image.tmdb.org/t/p/w1280/xnqustik40ogVwXzOiqH5g7U4N6.jpg", imageType: "backdrop", displayOrder: 4 },
  { id: "img-wed-5", movieId: "tv-wednesday", imageUrl: "https://image.tmdb.org/t/p/w1280/lmZFxXgJE3vgr8zqvgFuZAdDXap.jpg", imageType: "backdrop", displayOrder: 5 },
  { id: "img-wed-6", movieId: "tv-wednesday", imageUrl: "https://image.tmdb.org/t/p/w1280/bOGkgRGdhrBYJSLpXaxhXVstNsV.jpg", imageType: "backdrop", displayOrder: 6 },
];

const DEFAULT_SUBTITLES: SubtitleFile[] = [
  {
    id: "sub-av-1",
    targetType: "movie",
    targetId: "m-avengers-1",
    targetTitle: "The Avengers (2012)",
    language: "Sinhala",
    fileName: "The.Avengers.2012.1080p.BluRay.x264.Sinhala.srt",
    fileSize: "78.4 KB",
    fileUrl: "/api/subtitles/download/sample-sub-1",
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "sub-av-2",
    targetType: "movie",
    targetId: "m-avengers-2",
    targetTitle: "Avengers: Age of Ultron (2015)",
    language: "Sinhala",
    fileName: "Avengers.Age.of.Ultron.2015.1080p.BluRay.Sinhala.srt",
    fileSize: "84.2 KB",
    fileUrl: "/api/subtitles/download/sample-sub-2",
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "sub-av-3",
    targetType: "movie",
    targetId: "m-avengers-3",
    targetTitle: "Avengers: Infinity War (2018)",
    language: "Sinhala",
    fileName: "Avengers.Infinity.War.2018.1080p.Sinhala.srt",
    fileSize: "92.1 KB",
    fileUrl: "/api/subtitles/download/sample-sub-3",
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "sub-av-4",
    targetType: "movie",
    targetId: "m-avengers-4",
    targetTitle: "Avengers: Endgame (2019)",
    language: "Sinhala",
    fileName: "Avengers.Endgame.2019.1080p.Sinhala.srt",
    fileSize: "112.6 KB",
    fileUrl: "/api/subtitles/download/sample-sub-4",
    uploadedAt: new Date().toISOString(),
  },
];

// Pre-populated Sample TV Series
const DEFAULT_TV_SERIES: TVSeries[] = [
  {
    id: "tv-got",
    slug: "game-of-thrones",
    imdbId: "tt0944947",
    tmdbId: 1399,
    title: "Game of Thrones",
    originalTitle: "Game of Thrones",
    firstAirDate: "2011-04-17",
    year: 2011,
    rating: 9.2,
    genres: ["Drama", "Action & Adventure", "Sci-Fi & Fantasy"],
    overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
    sinhalaDescription: "HBO නාලිකාව ඔස්සේ විකාශය වූ ලොව අංක එකේ මනඃකල්පිත ත්‍රාසජනක ටෙලි නාට්‍ය මාලාව වන 'Game of Thrones' යනු ලොව පුරා කෝටි සංඛ්‍යාත ප්‍රේක්ෂක හදවත් වසඟ කළ විශිෂ්ටතම නිර්මාණයකි. වෙස්ටරෝස් (Westeros) දේශයේ යකඩ සිංහාසනය (Iron Throne) අත්පත් කරගැනීම සඳහා බලගතු වංශවත් පවුල් හතක් අතර ඇතිවන ලේවැකි දේශපාලන කුමන්ත්‍රණ සහ මහා යුද්ධ මෙහි මනාව දිගහැරේ.\n\nඋතුරේ පවුරෙන් ඔබ්බෙහි සිට අවදිවන අභිරහස් වයිට් වෝකර්ස් (White Walkers) හමුදාව සහ ඩෙනෙරිස් ටාගේරියන්ගේ ගිනි පිඹින මකරන්ගේ ආගමනය කතාව තවත් උණුසුම් කරයි. සෑම කොටසක් පාසාම කුතුහලය සහ විස්මය දනවමින් දිවෙන මෙම දැවැන්ත කතා මාලාව සිංහල උපසිරැසි සමඟ නරඹන්න.",
    posterUrl: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
    creators: ["David Benioff", "D.B. Weiss"],
    cast: ["Emilia Clarke", "Kit Harington", "Peter Dinklage", "Lena Headey", "Nikolaj Coster-Waldau", "Sophie Turner", "Maisie Williams"],
    seasonsCount: 8,
    episodesCount: 73,
    hasSinhalaSub: true,
    published: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tv-stranger-things",
    slug: "stranger-things",
    imdbId: "tt4574334",
    tmdbId: 66732,
    title: "Stranger Things",
    originalTitle: "Stranger Things",
    firstAirDate: "2016-07-15",
    year: 2016,
    rating: 8.7,
    genres: ["Sci-Fi & Fantasy", "Drama", "Mystery"],
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    sinhalaDescription: "නෙට්ෆ්ලික්ස් (Netflix) හි අතිශය ජනප්‍රියත්වයට පත් 'Stranger Things' යනු 80 දශකයේ ඇමරිකාවේ හෝකින්ස් නමැති කුඩා නගරයක සිදුවන අද්භූත හා විද්‍යා ප්‍රබන්ධ සිදුවීම් මාලාවකි. විල් බයර්ස් නම් කුඩා දරුවා අතුරුදහන් වීමත් සමඟ, ඔහුගේ මිතුරන්, මව සහ පොලිස් ප්‍රධානියා ඔහුව සෙවීමේදී රහස් රජයේ පර්යේෂණාගාරයක්, අද්භූත සමාන්තර ලෝකයක් (Upside Down) සහ අද්භූත බලයන් සහිත 'Eleven' නම් ගැහැණු ළමයා හමුවේ.\n\nළමා මිත්‍රත්වය, ආදරය සහ බියජනක රාක්ෂයින්ගෙන් පිරි මෙම කතා මාලාව නැරඹීමෙන් ඔබට අද්විතීය ත්‍රාසජනක අත්දැකීමක් හිමිවනු ඇත. සිංහල උපසිරැසි සමඟ දැන්ම නරඹන්න!",
    posterUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
    creators: ["The Duffer Brothers"],
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour", "Gaten Matarazzo", "Caleb McLaughlin", "Noah Schnapp", "Sadie Sink"],
    seasonsCount: 4,
    episodesCount: 34,
    hasSinhalaSub: true,
    published: true,
    featured: true,
    isVip: true,
    vipTier: "all",
    vipDriveLink: "https://drive.google.com/drive/folders/serieshub-stranger-things-vip",
    vipMegaLink: "https://mega.nz/folder/strangerthings-vip",
    vipTelegramCode: "VIP_BOT_STRANGER_THINGS",
    vipNotes: "4K HDR & 1080p 10-Bit Sinhala Subtitle Master Print",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tv-breaking-bad",
    slug: "breaking-bad",
    imdbId: "tt0903747",
    tmdbId: 1396,
    title: "Breaking Bad",
    originalTitle: "Breaking Bad",
    firstAirDate: "2008-01-20",
    year: 2008,
    rating: 9.5,
    genres: ["Drama", "Crime", "Thriller"],
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's financial future.",
    sinhalaDescription: "IMDb හි 9.5 ක වාර්තාගත ඉහළම ශ්‍රේණිගත කිරීමක් හිමිකරගත් 'Breaking Bad' යනු සිනමා ඉතිහාසයේ බිහිවූ අසහාය විශිෂ්ටතම ටෙලි නාට්‍ය මාලාවකි. පෙනහළු පිළිකාවක් වැළඳී ඇති බව දැනගන්නා සාමාන්‍ය උසස් පාසල් රසායන විද්‍යා ගුරුවරයෙකු වන වෝල්ටර් වයිට් (Walter White), තම මරණයෙන් පසු පවුලේ මූල්‍යමය අනාගතය සුරක්ෂිත කිරීම සඳහා තම පැරණි ශිෂ්‍යයෙකු වන ජෙසී පින්ක්මන් (Jesse Pinkman) සමඟ එක්ව අතිශය පිරිසිදු 'Methamphetamine' මත්ද්‍රව්‍ය නිෂ්පාදනයට පිවිසෙයි.\n\nසාමාන්‍ය ගුරුවරයෙකු වූ වෝල්ටර් වයිට්, 'හයිසන්බර්ග්' (Heisenberg) නම් අනුකම්පා විරහිත මත්ද්‍රව්‍ය රජෙකු බවට පත්වන ආකාරය විශ්මයජනක රංගනයෙන් හා අධ්‍යක්ෂණයෙන් මෙහි විදහා දැක්වේ. සිංහල උපසිරැසි සමඟ ඉහළම තත්ත්වයෙන් නරඹන්න.",
    posterUrl: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=HhesaQXLuRY",
    creators: ["Vince Gilligan"],
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "Dean Norris", "Betsy Brandt", "RJ Mitte", "Bob Odenkirk", "Giancarlo Esposito"],
    seasonsCount: 5,
    episodesCount: 62,
    hasSinhalaSub: true,
    published: true,
    featured: true,
    isVip: true,
    vipTier: "all",
    vipDriveLink: "https://drive.google.com/drive/folders/serieshub-breaking-bad-vip",
    vipMegaLink: "https://mega.nz/folder/breakingbad-vip",
    vipTelegramCode: "VIP_BOT_BREAKING_BAD",
    vipNotes: "1080p BluRay Remaster Direct High-Speed Download",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tv-wednesday",
    slug: "wednesday",
    imdbId: "tt13443470",
    tmdbId: 119051,
    title: "Wednesday",
    originalTitle: "Wednesday",
    firstAirDate: "2022-11-23",
    year: 2022,
    rating: 8.5,
    genres: ["Sci-Fi & Fantasy", "Mystery", "Comedy"],
    overview: "Wednesday Addams is expelled from school and sent to Nevermore Academy, a boarding school for monstrous misfits. She must master her psychic ability to solve a murder mystery.",
    sinhalaDescription: "ටිම් බර්ටන්ගේ (Tim Burton) අසමසම අධ්‍යක්ෂණයෙන් හැඩවුණු නෙට්ෆ්ලික්ස් හි ගෝලීය රැල්ලක් ඇති කළ 'Wednesday' කතා මාලාව ඇඩම්ස් ෆැමිලි (Addams Family) හි ආකර්ෂණීය වෙඩ්න්ස්ඩේ ඇඩම්ස්ගේ පාසල් දිවිය වටා ගෙතී ඇත. අද්භූත පුද්ගලයන් සඳහා වූ 'Nevermore Academy' නේවාසික පාසලට ඇතුළත් වන ඇය, නගරයේ සිදුවන බිහිසුණු ඝාතන රැල්ලක අබිරහස විසඳීමට තම මානසික (psychic) හැකියාවන් යොදාගනී.\n\nහාස්‍යය, අබිරහස සහ ගොතික් ශෛලියේ මනරම් දර්ශනවලින් අනූන මෙම කතා මාලාව ජෙනා ඔර්ටෙගාගේ (Jenna Ortega) අතිවිශිෂ්ට රංගනයෙන් ඔපමට්ටම් වී ඇත. සිංහල උපසිරැසි සමඟින් රසවිඳින්න.",
    posterUrl: "https://image.tmdb.org/t/p/w500/9PFonQ9dcSlOGbaDo2SAPwCwISx.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=Di310BC8urj",
    creators: ["Alfred Gough", "Miles Millar"],
    cast: ["Jenna Ortega", "Gwendoline Christie", "Riki Lindhome", "Jamie McShane", "Hunter Doohan", "Percy Hynes White", "Emma Myers"],
    seasonsCount: 1,
    episodesCount: 8,
    hasSinhalaSub: true,
    published: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Sample Season & Episode data for TV series with season-wise descriptions and 720p/1080p options
const DEFAULT_SEASONS: Season[] = [
  // Game of Thrones Seasons
  {
    id: "seas-got-1",
    seriesId: "tv-got",
    seasonNumber: 1,
    name: "Season 1",
    overview: "Trouble is brewing in the Seven Kingdoms of Westeros. For the driven inhabitants of this visionary world, control of Westeros' Iron Throne holds the lure of great power.",
    sinhalaDescription: "Game of Thrones පළමු Season එක තුළින් වෙස්ටරෝස් රාජධානියේ අභිෂේකය හා සිංහාසනය වෙනුවෙන් ආරම්භ වන මහා ලේවැකි දේශපාලන සටන දිගහැරේ. නෙඩ් ස්ටාර්ක් (Ned Stark) රජුගේ ප්‍රධාන අමාත්‍ය ධුරයට පත්වන අතර, ලැනිස්ටර් වංශිකයන්ගේ කුමන්ත්‍රණ හා උතුරේ අභිරහස් වයිට් වෝකර්ස් තර්ජනය මෙහිදී හෙළිවේ.",
    posterUrl: "https://image.tmdb.org/t/p/w500/wgfKiq9mMUr9mIDr7xVz1pM24B5.jpg",
    episodesCount: 5,
  },
  {
    id: "seas-got-2",
    seriesId: "tv-got",
    seasonNumber: 2,
    name: "Season 2",
    overview: "The cold winds of winter are rising. Five kings claim the Iron Throne in a devastating civil war.",
    sinhalaDescription: "දෙවන Season එකේදී රජවරුන් පස්දෙනෙකු අතර මහා යුද්ධය (War of the Five Kings) ඇවිලී යයි. බ්ලැක්වෝටර් (Blackwater) මුහුදු සටන සහ ටිරියන් ලැනිස්ටර්ගේ සුවිශේෂී උපායශීලී නායකත්වය කතාවේ උච්චතම අවස්ථාවකට රැගෙන යයි.",
    posterUrl: "https://image.tmdb.org/t/p/w500/52ft29k57WqgcegP6YgCjXF02qY.jpg",
    episodesCount: 5,
  },
  {
    id: "seas-got-3",
    seriesId: "tv-got",
    seasonNumber: 3,
    name: "Season 3",
    overview: "Duplicity and treachery... nobility and honor... conquest and triumph. The battle for the Iron Throne rages on.",
    sinhalaDescription: "සිනමා ඉතිහාසයේ කිසිදා අමතක නොවන රතු මංගල්‍යය (The Red Wedding) සහ ඩෙනෙරිස්ගේ නොනැසී පවතින අසමසම හමුදාවේ නැගිටීම තුන්වන Season එක ඔස්සේ විදහා දැක්වේ.",
    posterUrl: "https://image.tmdb.org/t/p/w500/4nslJ1B8fO8e5Bq1Fq5QzLw0YvM.jpg",
    episodesCount: 5,
  },

  // Stranger Things Seasons
  {
    id: "seas-st-1",
    seriesId: "tv-stranger-things",
    seasonNumber: 1,
    name: "Season 1",
    overview: "A love letter to the '80s classics that captivated a generation, Stranger Things is set in 1983 Indiana, where a young boy vanishes into thin air.",
    sinhalaDescription: "Stranger Things පළමු Season එකේදී විල් බයර්ස් නම් දරුවා හෝකින්ස් නගරයෙන් අද්භූත ලෙස අතුරුදහන් වේ. 'Upside Down' නම් සමාන්තර ලෝකය සහ Eleven නම් අද්භූත බලයන් ඇති දැරියගේ පැමිණීම මෙහිදී දැකගත හැකිය.",
    posterUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    episodesCount: 5,
  },
  {
    id: "seas-st-2",
    seriesId: "tv-stranger-things",
    seasonNumber: 2,
    name: "Season 2",
    overview: "It's 1984 and the citizens of Hawkins, Indiana are still reeling from the horrors of the Demogorgon and the secrets of Hawkins Lab.",
    sinhalaDescription: "දෙවන Season එකේදී හෝකින්ස් නගරයට 'Mind Flayer' නම් යෝධ කළු සෙවණැලි රාක්ෂයාගේ තර්ජනය එල්ල වේ. විල් බයර්ස් නැවතත් අද්භූත සිහින සහ ව්‍යාකූලත්වයට පත්වෙයි.",
    posterUrl: "https://image.tmdb.org/t/p/w500/lGlGg8bC8JmUuW0qVp9O0T3tWwW.jpg",
    episodesCount: 5,
  },
  {
    id: "seas-st-3",
    seriesId: "tv-stranger-things",
    seasonNumber: 3,
    name: "Season 3",
    overview: "It's 1985 in Hawkins, Indiana, and summer's heating up. School's out, there's a brand new mall in town, and the Hawkins crew are on the cusp of adulthood.",
    sinhalaDescription: "තුන්වන Season එක 1985 ගිම්හානයේ ස්ටාර්කෝට් (Starcourt Mall) සාප්පු සංකීර්ණය වටා සිදුවේ. රහස් රුසියානු බංකරයක් සහ නගරය පුරා පැතිරෙන බිහිසුණු ආසාදනයක් නව සටනකට මඟ පාදයි.",
    posterUrl: "https://image.tmdb.org/t/p/w500/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    episodesCount: 5,
  },

  // Breaking Bad Seasons
  {
    id: "seas-bb-1",
    seriesId: "tv-breaking-bad",
    seasonNumber: 1,
    name: "Season 1",
    overview: "High school chemistry teacher Walter White's life is turned upside down when he's diagnosed with Stage III lung cancer.",
    sinhalaDescription: "Breaking Bad පළමු Season එකේදී සාමාන්‍ය ගුරුවරයෙකු වන වෝල්ටර් වයිට් තම පවුලේ අනාගතය වෙනුවෙන් ජෙසී පින්ක්මන් සමඟ මත්ද්‍රව්‍ය නිෂ්පාදනයට අතගසයි.",
    posterUrl: "https://image.tmdb.org/t/p/w500/1yeAQyvE5zY9G6iHqg2uL3Z8h6k.jpg",
    episodesCount: 5,
  },
  {
    id: "seas-bb-2",
    seriesId: "tv-breaking-bad",
    seasonNumber: 2,
    name: "Season 2",
    overview: "Walt and Jesse realize just how dire their business has become as they try to distribute on a larger scale.",
    sinhalaDescription: "දෙවන Season එකේදී වෝල්ටර් සහ ජෙසී තම නිෂ්පාදන ජාලය පුළුල් කිරීමට යාමේදී ප්‍රචණ්ඩකාරී අපරාධකරුවන් හා නීතිඥ සෝල් ගුඩ්මන් (Saul Goodman) හමුවෙයි.",
    posterUrl: "https://image.tmdb.org/t/p/w500/e3oLpM7cQ1Jk9Vp8q4q2W7YqZ2X.jpg",
    episodesCount: 5,
  },

  // Wednesday Seasons
  {
    id: "seas-wed-1",
    seriesId: "tv-wednesday",
    seasonNumber: 1,
    name: "Season 1",
    overview: "Wednesday Addams begins her journey at Nevermore Academy, investigating a monstrous killing spree.",
    sinhalaDescription: "Wednesday පළමු Season එකේදී නෙවර්මෝර් ඇකඩමියට ඇතුළත් වන වෙඩ්න්ස්ඩේ ඇඩම්ස්, නගරය බියපත් කළ අද්භූත ඝාතකයා සොයා විමර්ශන පවත්වයි.",
    posterUrl: "https://image.tmdb.org/t/p/w500/9PFonQ9dcSlOGbaDo2SAPwCwISx.jpg",
    episodesCount: 5,
  },
];

const DEFAULT_EPISODES: Episode[] = [
  // Game of Thrones Season 1 Episodes
  {
    id: "ep-got-101",
    seriesId: "tv-got",
    seasonId: "seas-got-1",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "Winter Is Coming",
    airDate: "Sep. 07, 2008",
    runtime: 62,
    overview: "Lord Ned Stark is torn between his family and an old friend when asked to serve at the side of King Robert Baratheon.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/9p3iB5t7x4xP7k9L1n6v2m4P5Q8.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/9p3iB5t7x4xP7k9L1n6v2m4P5Q8.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    download720pSize: "420 MB",
    download1080pSize: "1.1 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-1",
    hasSinhalaSub: true,
    published: true,
  },
  {
    id: "ep-got-102",
    seriesId: "tv-got",
    seasonId: "seas-got-1",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "The Kingsroad",
    airDate: "Sep. 14, 2008",
    runtime: 56,
    overview: "While Bran recovers from his fall, Ned leaves Stark house to serve as the King's Hand; Jon Snow heads north.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    download720pSize: "390 MB",
    download1080pSize: "980 MB",
    subtitleUrl: "/api/subtitles/download/sample-sub-2",
    hasSinhalaSub: true,
    published: true,
  },
  {
    id: "ep-got-103",
    seriesId: "tv-got",
    seasonId: "seas-got-1",
    seasonNumber: 1,
    episodeNumber: 3,
    title: "Lord Snow",
    airDate: "Sep. 21, 2008",
    runtime: 58,
    overview: "Jon begins his training with the Night's Watch. Ned confronts his past and secrets in King's Landing.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    download720pSize: "410 MB",
    download1080pSize: "1.05 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-3",
    hasSinhalaSub: true,
    published: true,
  },
  {
    id: "ep-got-104",
    seriesId: "tv-got",
    seasonId: "seas-got-1",
    seasonNumber: 1,
    episodeNumber: 4,
    title: "Cripples, Bastards, and Broken Things",
    airDate: "Sep. 28, 2008",
    runtime: 56,
    overview: "Ned investigates the death of Jon Arryn. Tyrion finds himself in the wrong place at the wrong time.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/lmZFxXgJE3vgr8zqvgFuZAdDXap.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/lmZFxXgJE3vgr8zqvgFuZAdDXap.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    download720pSize: "430 MB",
    download1080pSize: "1.15 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-1",
    hasSinhalaSub: true,
    published: true,
  },
  {
    id: "ep-got-105",
    seriesId: "tv-got",
    seasonId: "seas-got-1",
    seasonNumber: 1,
    episodeNumber: 5,
    title: "The Wolf and the Lion",
    airDate: "Oct. 05, 2008",
    runtime: 55,
    overview: "Ned refuses to participate in King Robert's plan to assassinate the pregnant Daenerys Targaryen.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    download720pSize: "415 MB",
    download1080pSize: "1.08 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-2",
    hasSinhalaSub: true,
    published: true,
  },

  // Game of Thrones Season 2 Episodes
  {
    id: "ep-got-201",
    seriesId: "tv-got",
    seasonId: "seas-got-2",
    seasonNumber: 2,
    episodeNumber: 1,
    title: "The North Remembers",
    airDate: "Apr. 01, 2012",
    runtime: 53,
    overview: "Tyrion arrives to serve as Hand of the King. Stannis Baratheon plans his bid for the throne.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    download720pSize: "400 MB",
    download1080pSize: "1.02 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-1",
    hasSinhalaSub: true,
    published: true,
  },
  {
    id: "ep-got-202",
    seriesId: "tv-got",
    seasonId: "seas-got-2",
    seasonNumber: 2,
    episodeNumber: 2,
    title: "The Night Lands",
    airDate: "Apr. 08, 2012",
    runtime: 54,
    overview: "Arya makes friends with Gendry on the road north. Theon returns home to the Iron Islands.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    download720pSize: "410 MB",
    download1080pSize: "1.05 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-2",
    hasSinhalaSub: true,
    published: true,
  },

  // Stranger Things Season 1 Episodes
  {
    id: "ep-st-101",
    seriesId: "tv-stranger-things",
    seasonId: "seas-st-1",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "Chapter One: The Vanishing of Will Byers",
    airDate: "Jul. 15, 2016",
    runtime: 48,
    overview: "On his way home from a friend's house, young Will sees something terrifying.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    download720pSize: "440 MB",
    download1080pSize: "1.12 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-1",
    hasSinhalaSub: true,
    published: true,
  },
  {
    id: "ep-st-102",
    seriesId: "tv-stranger-things",
    seasonId: "seas-st-1",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "Chapter Two: The Weirdo on Maple Street",
    airDate: "Jul. 15, 2016",
    runtime: 55,
    overview: "Lucas, Mike, and Dustin try to talk to the girl they found in the woods.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    download720pSize: "460 MB",
    download1080pSize: "1.18 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-2",
    hasSinhalaSub: true,
    published: true,
  },
  {
    id: "ep-st-103",
    seriesId: "tv-stranger-things",
    seasonId: "seas-st-1",
    seasonNumber: 1,
    episodeNumber: 3,
    title: "Chapter Three: Holly, Jolly",
    airDate: "Jul. 15, 2016",
    runtime: 51,
    overview: "An increasingly frantic Joyce believes Will is communicating with her through the Christmas lights.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/lGlGg8bC8JmUuW0qVp9O0T3tWwW.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/lGlGg8bC8JmUuW0qVp9O0T3tWwW.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    download720pSize: "425 MB",
    download1080pSize: "1.09 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-3",
    hasSinhalaSub: true,
    published: true,
  },

  // Breaking Bad Season 1 Episodes
  {
    id: "ep-bb-101",
    seriesId: "tv-breaking-bad",
    seasonId: "seas-bb-1",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "Pilot",
    airDate: "Jan. 20, 2008",
    runtime: 58,
    overview: "When an unassuming high school chemistry teacher is diagnosed with cancer, he decides to cook meth.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    download720pSize: "430 MB",
    download1080pSize: "1.10 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-1",
    hasSinhalaSub: true,
    published: true,
  },
  {
    id: "ep-bb-102",
    seriesId: "tv-breaking-bad",
    seasonId: "seas-bb-1",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "Cat's in the Bag...",
    airDate: "Jan. 27, 2008",
    runtime: 48,
    overview: "Walt and Jesse attempt to dispose of the two bodies in the RV.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    download720pSize: "395 MB",
    download1080pSize: "1.00 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-2",
    hasSinhalaSub: true,
    published: true,
  },

  // Wednesday Season 1 Episodes
  {
    id: "ep-wed-101",
    seriesId: "tv-wednesday",
    seasonId: "seas-wed-1",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "Wednesday's Child is Full of Woe",
    airDate: "Nov. 23, 2022",
    runtime: 59,
    overview: "When a deliciously wicked prank gets Wednesday expelled, her parents ship her off to Nevermore Academy.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    download720pSize: "450 MB",
    download1080pSize: "1.15 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-1",
    hasSinhalaSub: true,
    published: true,
  },
  {
    id: "ep-wed-102",
    seriesId: "tv-wednesday",
    seasonId: "seas-wed-1",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "Woe is the Loneliest Number",
    airDate: "Nov. 23, 2022",
    runtime: 48,
    overview: "The sheriff questions Wednesday about the night's strange events. Wednesday investigates the Poe Cup race.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w1280/9PFonQ9dcSlOGbaDo2SAPwCwISx.jpg",
    stillUrl: "https://image.tmdb.org/t/p/w1280/9PFonQ9dcSlOGbaDo2SAPwCwISx.jpg",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    video720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    video1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    download720pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    download1080pUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    download720pSize: "440 MB",
    download1080pSize: "1.10 GB",
    subtitleUrl: "/api/subtitles/download/sample-sub-2",
    hasSinhalaSub: true,
    published: true,
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          movies: parsed.movies || DEFAULT_MOVIES,
          movieImages: parsed.movieImages || DEFAULT_MOVIE_IMAGES,
          tvSeries: parsed.tvSeries || DEFAULT_TV_SERIES,
          seasons: parsed.seasons || DEFAULT_SEASONS,
          episodes: parsed.episodes || DEFAULT_EPISODES,
          collections: parsed.collections || DEFAULT_COLLECTIONS,
          subtitles: parsed.subtitles || DEFAULT_SUBTITLES,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          contactMessages: parsed.contactMessages || [],
        };
      }
    } catch (e) {
      console.error("Error reading db.json, using defaults", e);
    }

    const initial: DatabaseSchema = {
      movies: DEFAULT_MOVIES,
      movieImages: DEFAULT_MOVIE_IMAGES,
      tvSeries: DEFAULT_TV_SERIES,
      seasons: DEFAULT_SEASONS,
      episodes: DEFAULT_EPISODES,
      collections: DEFAULT_COLLECTIONS,
      subtitles: DEFAULT_SUBTITLES,
      settings: DEFAULT_SETTINGS,
      contactMessages: [],
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing db.json", e);
    }
  }

  // --- Settings ---
  getSettings(): SiteSettings {
    return this.data.settings;
  }

  updateSettings(settings: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData(this.data);
    return this.data.settings;
  }

  // --- Stats ---
  getStats() {
    return {
      totalFilms: this.data.movies.length,
      totalTVSeries: this.data.tvSeries.length,
      totalSeasons: this.data.seasons.length,
      totalEpisodes: this.data.episodes.length,
      totalCollections: this.data.collections.length,
      totalSubtitles: this.data.subtitles.length,
      totalMessages: this.data.contactMessages.length,
    };
  }

  // --- Movies ---
  getMovies(options?: {
    publishedOnly?: boolean;
    featured?: boolean;
    search?: string;
    genre?: string;
    year?: number;
    collection?: string;
    limit?: number;
    page?: number;
    sort?: string;
  }): { movies: Movie[]; total: number } {
    let list = [...this.data.movies];

    if (options?.publishedOnly) {
      list = list.filter((m) => m.published);
    }

    if (options?.featured) {
      list = list.filter((m) => m.featured);
    }

    if (options?.genre) {
      list = list.filter((m) => m.genres.some((g) => g.toLowerCase() === options.genre!.toLowerCase()));
    }

    if (options?.year) {
      list = list.filter((m) => m.year === options.year);
    }

    if (options?.collection) {
      list = list.filter((m) => m.collections?.includes(options.collection!));
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.originalTitle.toLowerCase().includes(q) ||
          m.imdbId.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.cast.some((c) => c.toLowerCase().includes(q)) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.year.toString().includes(q)
      );
    }

    // Sort
    if (options?.sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (options?.sort === "year_desc") {
      list.sort((a, b) => b.year - a.year);
    } else if (options?.sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: latest createdAt or releaseDate
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = list.length;
    if (options?.limit && options?.limit > 0) {
      const page = options.page || 1;
      const start = (page - 1) * options.limit;
      list = list.slice(start, start + options.limit);
    }

    return { movies: list, total };
  }

  getMovieByIdOrSlug(idOrSlug: string): (Movie & { images: MovieImage[]; subtitles: SubtitleFile[] }) | null {
    const movie = this.data.movies.find((m) => m.id === idOrSlug || m.slug === idOrSlug || m.imdbId === idOrSlug);
    if (!movie) return null;

    const images = this.data.movieImages.filter((img) => img.movieId === movie.id);
    const subtitles = this.data.subtitles.filter((s) => s.targetType === "movie" && s.targetId === movie.id);

    return {
      ...movie,
      images,
      subtitles,
    };
  }

  createMovie(movieData: Omit<Movie, "id" | "slug" | "createdAt" | "updatedAt"> & { images?: string[] }): Movie {
    const id = `m-${Date.now()}`;
    const slug = slugify(`${movieData.title}-${movieData.year || ""}`);

    const newMovie: Movie = {
      ...movieData,
      id,
      slug,
      collections: movieData.collections || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.movies.unshift(newMovie);

    // If 6 unique images were provided, store them in movieImages
    if (movieData.images && Array.isArray(movieData.images)) {
      const uniqueUrls = Array.from(new Set(movieData.images)).slice(0, 6);
      uniqueUrls.forEach((url, idx) => {
        this.data.movieImages.push({
          id: `img-${id}-${idx + 1}`,
          movieId: id,
          imageUrl: url,
          imageType: "backdrop",
          displayOrder: idx + 1,
        });
      });
    }

    this.saveData(this.data);
    return newMovie;
  }

  updateMovie(id: string, updates: Partial<Movie> & { images?: string[] }): Movie | null {
    const idx = this.data.movies.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const current = this.data.movies[idx];
    const updated: Movie = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.title && updates.title !== current.title) {
      updated.slug = slugify(`${updates.title}-${updated.year || ""}`);
    }

    this.data.movies[idx] = updated;

    // Update images if provided
    if (updates.images && Array.isArray(updates.images)) {
      this.data.movieImages = this.data.movieImages.filter((img) => img.movieId !== id);
      const uniqueUrls = Array.from(new Set(updates.images)).slice(0, 6);
      uniqueUrls.forEach((url, i) => {
        this.data.movieImages.push({
          id: `img-${id}-${i + 1}`,
          movieId: id,
          imageUrl: url,
          imageType: "backdrop",
          displayOrder: i + 1,
        });
      });
    }

    this.saveData(this.data);
    return updated;
  }

  deleteMovie(id: string): boolean {
    const len = this.data.movies.length;
    this.data.movies = this.data.movies.filter((m) => m.id !== id);
    this.data.movieImages = this.data.movieImages.filter((img) => img.movieId !== id);
    this.data.subtitles = this.data.subtitles.filter((s) => !(s.targetType === "movie" && s.targetId === id));
    this.saveData(this.data);
    return this.data.movies.length < len;
  }

  // --- TV Series ---
  getTVSeries(options?: {
    publishedOnly?: boolean;
    featured?: boolean;
    search?: string;
    genre?: string;
    year?: number;
    limit?: number;
    page?: number;
  }): { series: TVSeries[]; total: number } {
    let list = [...this.data.tvSeries];

    if (options?.publishedOnly) {
      list = list.filter((s) => s.published);
    }
    if (options?.featured) {
      list = list.filter((s) => s.featured);
    }
    if (options?.genre) {
      list = list.filter((s) => s.genres.some((g) => g.toLowerCase() === options.genre!.toLowerCase()));
    }
    if (options?.year) {
      list = list.filter((s) => s.year === options.year);
    }
    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.originalTitle.toLowerCase().includes(q) ||
          s.imdbId.toLowerCase().includes(q) ||
          s.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = list.length;
    if (options?.limit && options?.limit > 0) {
      const page = options.page || 1;
      const start = (page - 1) * options.limit;
      list = list.slice(start, start + options.limit);
    }

    return { series: list, total };
  }

  getSeriesByIdOrSlug(idOrSlug: string): (TVSeries & { seasons: (Season & { episodes: Episode[] })[] }) | null {
    const series = this.data.tvSeries.find((s) => s.id === idOrSlug || s.slug === idOrSlug || s.imdbId === idOrSlug);
    if (!series) return null;

    const seasons = this.data.seasons
      .filter((seas) => seas.seriesId === series.id)
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
      .map((seas) => {
        const episodes = this.data.episodes
          .filter((ep) => ep.seasonId === seas.id)
          .sort((a, b) => a.episodeNumber - b.episodeNumber);
        return {
          ...seas,
          episodes,
        };
      });

    // Lookup series images from movieImages or series object
    const seriesImages = (series.images && series.images.length > 0)
      ? series.images
      : this.data.movieImages.filter((img) => img.movieId === series.id);

    return {
      ...series,
      images: seriesImages,
      seasons,
    };
  }

  createTVSeries(seriesData: Omit<TVSeries, "id" | "slug" | "createdAt" | "updatedAt"> & { images?: string[] }): TVSeries {
    const id = `tv-${Date.now()}`;
    const slug = slugify(`${seriesData.title}-${seriesData.year || ""}`);

    const rawImages = seriesData.images || [];
    const uniqueImages: string[] = Array.isArray(rawImages)
      ? Array.from(new Set(rawImages.map((img: any) => (typeof img === "string" ? img : img?.imageUrl)).filter(Boolean))).slice(0, 6)
      : [];

    const newSeries: TVSeries = {
      ...seriesData,
      id,
      slug,
      images: uniqueImages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.tvSeries.unshift(newSeries);

    // Save into movieImages table as well
    uniqueImages.forEach((url, idx) => {
      this.data.movieImages.push({
        id: `img-${id}-${idx + 1}`,
        movieId: id,
        imageUrl: url,
        imageType: "backdrop",
        displayOrder: idx + 1,
      });
    });

    // If seasons and episodes are provided during series creation, save them
    if (Array.isArray((seriesData as any).seasons) && (seriesData as any).seasons.length > 0) {
      this.setSeriesSeasonsAndEpisodes(id, (seriesData as any).seasons);
    }

    this.saveData(this.data);
    return newSeries;
  }

  updateTVSeries(id: string, updates: Partial<TVSeries> & { images?: string[]; seasons?: any[] }): TVSeries | null {
    const idx = this.data.tvSeries.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const current = this.data.tvSeries[idx];
    let processedImages = current.images;

    if (updates.images && Array.isArray(updates.images)) {
      processedImages = Array.from(new Set(updates.images.filter(Boolean))).slice(0, 6);
      this.data.movieImages = this.data.movieImages.filter((img) => img.movieId !== id);
      processedImages.forEach((url, i) => {
        const u = typeof url === "string" ? url : (url as any).imageUrl;
        if (u) {
          this.data.movieImages.push({
            id: `img-${id}-${i + 1}`,
            movieId: id,
            imageUrl: u,
            imageType: "backdrop",
            displayOrder: i + 1,
          });
        }
      });
    }

    const updated: TVSeries = {
      ...current,
      ...updates,
      images: processedImages,
      updatedAt: new Date().toISOString(),
    };

    if (updates.title && updates.title !== current.title) {
      updated.slug = slugify(`${updates.title}-${updated.year || ""}`);
    }

    this.data.tvSeries[idx] = updated;

    // If seasons are updated
    if (Array.isArray(updates.seasons)) {
      this.setSeriesSeasonsAndEpisodes(id, updates.seasons);
    }

    this.saveData(this.data);
    return updated;
  }

  deleteTVSeries(id: string): boolean {
    const len = this.data.tvSeries.length;
    this.data.tvSeries = this.data.tvSeries.filter((s) => s.id !== id);
    this.data.seasons = this.data.seasons.filter((s) => s.seriesId !== id);
    this.data.episodes = this.data.episodes.filter((e) => e.seriesId !== id);
    this.saveData(this.data);
    return this.data.tvSeries.length < len;
  }

  // --- Seasons & Episodes ---
  createSeason(seasonData: Omit<Season, "id">): Season {
    const id = `seas-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newSeason: Season = { ...seasonData, id };
    this.data.seasons.push(newSeason);
    this.saveData(this.data);
    return newSeason;
  }

  updateSeason(id: string, updates: Partial<Season>): Season | null {
    const idx = this.data.seasons.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.seasons[idx] = { ...this.data.seasons[idx], ...updates };
    this.saveData(this.data);
    return this.data.seasons[idx];
  }

  deleteSeason(id: string): boolean {
    const len = this.data.seasons.length;
    this.data.seasons = this.data.seasons.filter((s) => s.id !== id);
    this.data.episodes = this.data.episodes.filter((e) => e.seasonId !== id);
    this.saveData(this.data);
    return this.data.seasons.length < len;
  }

  setSeriesSeasonsAndEpisodes(seriesId: string, seasons: Array<Season & { episodes?: Episode[] }>): Season[] {
    // Remove existing seasons and episodes for this series
    this.data.seasons = this.data.seasons.filter((s) => s.seriesId !== seriesId);
    this.data.episodes = this.data.episodes.filter((e) => e.seriesId !== seriesId);

    const savedSeasons: Season[] = [];

    seasons.forEach((s, sIdx) => {
      const seasonId = s.id && !s.id.startsWith("temp-") ? s.id : `seas-${seriesId}-${s.seasonNumber || sIdx + 1}-${Date.now()}`;
      const seasonObj: Season = {
        id: seasonId,
        seriesId,
        seasonNumber: s.seasonNumber || sIdx + 1,
        name: s.name || `Season ${s.seasonNumber || sIdx + 1}`,
        overview: s.overview || "",
        sinhalaDescription: s.sinhalaDescription || "",
        posterUrl: s.posterUrl || "",
        episodesCount: s.episodes?.length || s.episodesCount || 0,
      };

      this.data.seasons.push(seasonObj);
      savedSeasons.push(seasonObj);

      if (Array.isArray(s.episodes)) {
        s.episodes.forEach((ep, epIdx) => {
          const epId = ep.id && !ep.id.startsWith("temp-") ? ep.id : `ep-${seasonId}-${ep.episodeNumber || epIdx + 1}-${Date.now()}`;
          const episodeObj: Episode = {
            id: epId,
            seriesId,
            seasonId,
            seasonNumber: seasonObj.seasonNumber,
            episodeNumber: ep.episodeNumber || epIdx + 1,
            title: ep.title || `Episode ${ep.episodeNumber || epIdx + 1}`,
            airDate: ep.airDate || "",
            runtime: ep.runtime || 45,
            overview: ep.overview || "",
            thumbnailUrl: ep.thumbnailUrl || ep.stillUrl || "",
            stillUrl: ep.stillUrl || ep.thumbnailUrl || "",
            streamingUrl: ep.streamingUrl || ep.video720pUrl || ep.video1080pUrl || ep.videoUrl || "",
            videoUrl: ep.videoUrl || ep.video720pUrl || ep.video1080pUrl || "",
            video720pUrl: ep.video720pUrl || ep.streamingUrl || "",
            video1080pUrl: ep.video1080pUrl || ep.streamingUrl || "",
            downloadUrl: ep.downloadUrl || ep.download720pUrl || ep.download1080pUrl || "",
            download720pUrl: ep.download720pUrl || ep.downloadUrl || "",
            download1080pUrl: ep.download1080pUrl || ep.downloadUrl || "",
            download720pSize: ep.download720pSize || "450 MB",
            download1080pSize: ep.download1080pSize || "1.1 GB",
            subtitleUrl: ep.subtitleUrl || "",
            subtitleFileName: ep.subtitleFileName || "",
            hasSinhalaSub: ep.hasSinhalaSub !== undefined ? ep.hasSinhalaSub : true,
            published: ep.published !== undefined ? ep.published : true,
          };
          this.data.episodes.push(episodeObj);
        });
      }
    });

    this.saveData(this.data);
    return savedSeasons;
  }

  createEpisode(episodeData: Omit<Episode, "id">): Episode {
    const id = `ep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newEpisode: Episode = { ...episodeData, id };
    this.data.episodes.push(newEpisode);
    this.saveData(this.data);
    return newEpisode;
  }

  updateEpisode(id: string, updates: Partial<Episode>): Episode | null {
    const idx = this.data.episodes.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.data.episodes[idx] = { ...this.data.episodes[idx], ...updates };
    this.saveData(this.data);
    return this.data.episodes[idx];
  }

  deleteEpisode(id: string): boolean {
    const len = this.data.episodes.length;
    this.data.episodes = this.data.episodes.filter((e) => e.id !== id);
    this.saveData(this.data);
    return this.data.episodes.length < len;
  }

  // --- Collections ---
  getCollections(): MovieCollection[] {
    return this.data.collections;
  }

  getCollectionBySlug(slug: string): (MovieCollection & { movies: Movie[] }) | null {
    const col = this.data.collections.find((c) => c.slug === slug || c.id === slug);
    if (!col) return null;

    const movies = this.data.movies.filter((m) => col.movieIds.includes(m.id) || m.collections?.includes(col.id));
    return {
      ...col,
      movies,
    };
  }

  createCollection(data: Omit<MovieCollection, "id" | "slug">): MovieCollection {
    const id = `col-${Date.now()}`;
    const slug = slugify(data.name);
    const newCol: MovieCollection = { ...data, id, slug };
    this.data.collections.push(newCol);
    this.saveData(this.data);
    return newCol;
  }

  updateCollection(id: string, updates: Partial<MovieCollection>): MovieCollection | null {
    const idx = this.data.collections.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.collections[idx] = { ...this.data.collections[idx], ...updates };
    this.saveData(this.data);
    return this.data.collections[idx];
  }

  deleteCollection(id: string): boolean {
    const len = this.data.collections.length;
    this.data.collections = this.data.collections.filter((c) => c.id !== id);
    this.saveData(this.data);
    return this.data.collections.length < len;
  }

  // --- Subtitles ---
  getSubtitles(): SubtitleFile[] {
    return this.data.subtitles;
  }

  addSubtitle(sub: Omit<SubtitleFile, "id" | "uploadedAt">): SubtitleFile {
    const id = `sub-${Date.now()}`;
    const newSub: SubtitleFile = {
      ...sub,
      id,
      uploadedAt: new Date().toISOString(),
    };
    this.data.subtitles.unshift(newSub);

    // Update target movie/episode hasSinhalaSub
    if (sub.targetType === "movie") {
      const mIdx = this.data.movies.findIndex((m) => m.id === sub.targetId);
      if (mIdx !== -1) {
        this.data.movies[mIdx].hasSinhalaSub = true;
      }
    } else if (sub.targetType === "episode") {
      const eIdx = this.data.episodes.findIndex((e) => e.id === sub.targetId);
      if (eIdx !== -1) {
        this.data.episodes[eIdx].hasSinhalaSub = true;
        this.data.episodes[eIdx].subtitleUrl = newSub.fileUrl;
        this.data.episodes[eIdx].subtitleFileName = newSub.fileName;
      }
    }

    this.saveData(this.data);
    return newSub;
  }

  deleteSubtitle(id: string): boolean {
    const len = this.data.subtitles.length;
    this.data.subtitles = this.data.subtitles.filter((s) => s.id !== id);
    this.saveData(this.data);
    return this.data.subtitles.length < len;
  }

  // --- Contact Messages ---
  addContactMessage(msg: Omit<ContactMessage, "id" | "createdAt" | "read">): ContactMessage {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.data.contactMessages.unshift(newMsg);
    this.saveData(this.data);
    return newMsg;
  }

  getContactMessages(): ContactMessage[] {
    return this.data.contactMessages;
  }
}

export const db = new Database();
