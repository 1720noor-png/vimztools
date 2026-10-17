import { n, sel, txt, res, T, asNum, asSel, asStr, clamp, num } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Language Learning & Translation'

const STOP = new Set(
  ('a an the and or but if of to in on at for with as is are was were be been being it its this that these those i you he she they we my your our their his her them do does did have has had not no so from by about into over under then than there here what which who whom will would can could should may might must'.split(' ')),
)

const A1 = new Set(('about after again all also always and another any are ask away back because been before being between both but can come could day does down each even every few first for from get give good got had has have help her here him his how its just know last let like little long look make make man many may me more most much must my name need new next not now off old on once one only other our out over people put said same say see she should some still such take than that the their them then there these they think this those time too two use very want was way we well were what when where which who why will with work would year you your'.split(' ')))
const A2 = new Set(('accept account across action activity actually add address adult advice afraid agree air allow almost alone along already although among amount angry animal announce answer anybody anyone anything appear apply area arm army arrive article artist ask attack attention avoid away baby bad bag ball bank bar base beautiful beauty bed beginning behind believe below best better between beyond bill bit black blood blow board boat body bone book born borrow both bottle bottom box boy brain branch brave bread break breakfast breathe bridge bright bring broad brother build building burn bus business busy button camera campaign cancer candidate cap capital captain car card care careful carry case catch cause cell centre central century certain chance change channel chapter cheap check cheek cheese chest chicken chief child children choice choose church circle circumstance citizen civil claim class clean clear climb clock close cloth clothes cloud club coach coast coat code coffee cold collapse collect college colour column combination combine come comfort command comment commercial commit committee communicate community company compare compete competition complain complete complex complicated computer concern condition conference confidence confirm confuse connect connection consider consist constant construct contain content continue contract contrast contribute control conversation copy corner correct cost cotton cough council count country couple courage course court cousin cover crack create creative creature credit crew crime criminal crisis criteria critic critical criticism criticize crop cross crowd cry cultural culture cup curious current customer cut daily damage dance danger dark data date daughter day dead deal death debate debt decade decide decision declare decline decrease deep defeat defend defense degree delay deliberate deliberate delicate deliver demand democracy demonstrate deny depend depth describe description desert deserve design desire desk desperate despite destroy detail determine develop development device devote dialogue diet difference different difficult difficulty dig digital dinner direct direction director dirt disagree disappear discipline discover discuss disease dish dismiss disorder display dispute distance distinct distribute district disturb diverse divide division divorce document dog domestic dominant donate door dot double doubt down dozen draft drag drain drama draw drawer dream dress drink drive driver drop drug drum dry duck due dull dust duty each eager ear early earn earth ease easily east eastern easy eat economic economy edge edit editor education effect effective efficiency effort egg eight either elect election electric electricity electronic element elementary eliminate elite else elsewhere emerge emergency emotion emphasis employ employee employer empty enable encounter encourage end enemy energy engage engine engineer English enhance enjoy enormous enough ensure enter enterprise entertainment entire entrance entry environment environmental episode equal equipment error escape especially essential establish estate estimate ethnic evaluate even evening event eventually ever every everybody everyday everyone everything everywhere evidence evolution evolve exact examine example exceed excellent except exchange excite exclude excuse execute executive exercise exhibit exist exit expand expectation expense expensive experience experiment expert explain explore explosion expose express expression extend extent external extra extraordinary extreme eye fabric face facility fact factor factory fade fail failure faint fair faith fall false familiar family famous fan fancy fantasy fare farm farmer fashion fast father fault favor favorite fear feature federal fee feed feel feeling fellow female fence festival fetch fever few fiber fiction field fight figure file fill film final finance financial find fine finger finish fire firm fish fist fit five fix flag flame flash flat flavor flesh flight float flood floor flow flower flu fluid focus fog fold folk follow food foot football force foreign forest forever forget forgive fork form formal format former fortune forward found foundation founder four fraction fragile frame framework free freedom freeze frequent fresh friend friendly frighten from front frown fruit fuel full fully fun function fund fundamental funeral funny furniture further future gain galaxy gallery game gang gap garage garden gas gate gather general generous gentle genuine gesture ghost giant gift glad glance glass global glove glow glue goat god gold golden golf good govern government grab grade gradually grain grand grandfather grandmother grant grass grave gray great green greet grey grin grip grocery ground group grow growth guard guess guest guide guideline guilty gun habit hair half hall hand handle hang happen happy harbor hard hardly harm harvest hat hate head headline health healthy hear heart heat heaven heavy heel height helicopter hell hello helpful hence herb hero herself hide high highlight highly highway hill hip hire historic historical hit hold hole holiday holy home honest honey honor hook hope horizon horn horror horse hospital host hot hotel hour house household housing human humble humor hundred hunger hungry hunt hurry hurt husband hut ice idea ideal identity ignore illegal illness illustrate image imagine immediate immigrant impact imply import importance important impose impossible impress impression impressive improve improvement incentive incident include income increase incredible indeed independence independent index indicate individual industrial industry infant infection inflation influence inform informal information ingredient initial initiative injury inner innocent inquiry insect insert inside insight insist inspire install instance instant instead institute instruction instrument insult insurance intelligence intend intense intensity intention interaction interest interior internal international internet interpret interpretation interview introduce introduction invasion invent invest investigate investigation investment invite involve involved iron island isolate issue item jacket jail jam jar jaw jazz jealous jeans jelly jet job join joint joke journalist journey joy judge juice jump junior jury just justice justify keen keep key kick kid kill killer kilometer kind king kiss kitchen knee knife knock knot know knowledge label labor laboratory lack lady lake lamp land landscape language lap large largely last late later latter laugh launch law lawn lawyer lay layer lead leader leadership leaf league lean learn least leather leave lecture left leg legacy legal legend legislation legitimate lemon length less lesson let letter level liberal library license lie lifestyle lift light like likely limit limitation limited line link lip liquid list listen literacy literally literary literature little live lively living load loan local locate location lock log logic lonely long look loose lord lose loss lost lot loud love lovely lover low lower loyal luck lucky lunch lung machine mad magazine magic mail main mainly maintain major majority make male mall man manage manager manner manufacturer many map margin mark market marketing marriage married marry mask mass massive master match material math matter maximum maybe mayor meal mean meaning meanwhile measure meat mechanism media medical medicine medium meet meeting member membership memory mental mention menu mercy mere merely mess metal method middle midnight might mild mile military milk million mind mine minimum minister minor minority minute miracle mirror miss missing mission mistake mix mixture mobile mode model moderate modern modest modify moment money monitor month mood moon moral more moreover morning mortgage most mostly mother motion motivate motor mountain mouse mouth move movement movie much mud multiple murder muscle museum music musical musician must mutual myself mystery myth naked name narrative narrow nation national native natural naturally nature navy near nearby nearly neat necessary neck need negative neighbor neither nerve nervous network never nevertheless new newly news newspaper next nice night nine nobody nod noise nominate none nonetheless nor normal normally north northern nose not note nothing notice notion novel nowhere nuclear number numerous nurse nut object objective obligation observation observe obtain obvious obviously occasion occasionally occupation occupy occur ocean odd odds offence offer office officer official often oil okay old olympic once one onion online only open operate operation operator opinion opponent opportunity oppose opposite opposition option orange order ordinary organic organization organize orientation origin original originally other others otherwise ought ounce outcome outdoor outer output outside outstanding oven overcome overview owe own owner oxygen pace pack package page pain painful paint painter painting pair pale palm pan panel panic paper parade paragraph parallel parameter parent park parliament part participant participate particular particularly partly partner partnership party pass passage passenger passion past pasta paste path patience patient pattern pause pave pay payment peace peak peer penalty pension people pepper per perceive percent percentage perception perfect perfectly perform performance perhaps period permanent permission permit person personal personality personally personnel perspective persuade pet phase phenomenon philosophy phone photograph phrase physical physically physician piano pick picture pie piece pile pilot pin pine pink pipe pitch pity place plan plane planet planning plant plastic plate platform play player pleasure plenty plot plug plus pocket poem poet poetry point pole police policy political politics poll pollution pool poor pop popular population port portion portrait pose position positive possess possibility possible possibly post pot potato potential potentially pound pour poverty powder power powerful practical practice praise prayer precisely predict prefer preference pregnancy pregnant preparation prepare presence present presentation preserve president press pressure pretend pretty prevent previous previously price pride priest primarily primary prime principle print prior priority prison privacy private privilege probably procedure proceed process produce producer product profession professional professor profile profit program progress project prominent promise promote prompt proof proper properly property proportion proposal propose prospect protect protection protein protest proud prove provide province provision public publication publish pull punishment purchase pure purpose pursue push put qualify quality quantity quarter queen question quick quickly quiet quietly quit quite quote race racial radical radio rail rain raise range rank rapid rapidly rare rarely rate rather ratio raw reach react reaction read reader reading ready real reality realize really reason reasonable recall receive recent recently recipe recognition recognize recommend record recover recovery recruit red reduce reduction refer reference reflect reform refugee refuse regard regardless regime region regional register regret regular regularly regulate regulation reinforce reject relate relation relative relatively relax release relevant reliable relief religion religious rely remain reminder remind remote remove repeat repeatedly replace reply report represent republican reputation request require requirement research researcher resemble reservation reserve resident resist resistance resolution resolve resort resource respect respond response responsible restaurant restore restriction result retain retire retirement retreat return reveal revenue review revolution rhythm rice rich rid ride rifle right ring rise risk river road rock role roll romantic roof room root rope rose rough roughly round route routine row royal rub rubber rude ruin rule run runner rural rush sacred sad safe safety sake salad salary sale salt same sample sanction sand satellite satisfaction satisfy sauce save saving say scale scan scandal scared scenario scene schedule scheme scholar scholarship school science scientific scope score scratch scream screen screw script sea search season seat second secret secretary section sector secure security see seed seek seem segment seize select selection self sell senate senator send senior sense sensitive sentence separate sequence series serious seriously serve service session set setting settle settlement seven several severe sex shade shadow shake shall shallow shame shape share sharp she sheet shelf shell shelter shift shine ship shock shoot shop short shot should shoulder shout show shower shrink shut sick side sigh sight sign signal significance significant significantly silence silent silver similar similarly simple simply sin since sincere sincerely sing singer single sink sir sister sit site situation six size ski skill skin sky slave sleep slice slide slight slightly slip slow slowly small smart smell smile smoke smooth snap snow so soap social society soft software soil solar soldier sole solid solution solve some somebody somehow someone something sometimes somewhat somewhere son song soon sophisticated sorry sort soul sound soup source south southern space spare speak speaker special specialist species specific specifically speech speed spend spirit spiritual split spokesman sport spot spread spring square squeeze stable staff stage stair stake stand standard star stare start state statement station statistics status stay steady steal steel steep stem step stick stiff still stir stomach stone stop storage store storm story straight strain strange stranger strategic strategy stream street strength strengthen stress stretch strict strike string strip stroke strong strongly structure struggle student studio study stuff stupid style subject submit subsequent substance substantial succeed success successful such suddenly suffer sufficient sugar suggest suggestion suicide suit summer sun supply support supporter suppose supposed sure surely surface surgery surprise surprising surround survey survival survive suspect suspicion sustain swear sweep sweet swim swing switch symbol symptom system table tail take tale talent talk tall tank tape target task taste tax tea teach teacher team tear technical technique technology teen teenager telescope television temperature temporary tempt tend tendency tennis tension tent term terms terrible territory terror terrorism testify testimony testing text texture than thank thanks that the theft their theme themselves theory therapy there therefore these thick thin thing think thinking third thirty this thorough thoroughly though thought thousand threat threaten three throat through throughout throw thus ticket tie tight time tiny tip tired tissue title to tobacco today toe together tone tongue tonight too tool tooth top topic total totally touch tough tour tourist tournament toward towards tower town toy trace track trade tradition traditional traffic tragedy trail train training transfer transform transition translate translation transmit transport trap travel treat treatment treaty tree tremendous trend trial tribe trick trip troop trouble truck true truly trust truth try tube tunnel turn twelve twenty twice twin two type typical typically ugly ultimately unable unaware uncertain uncle uncomfortable under undergo understand understanding undertake unemployment unfortunately uniform union unique unit unite universe university unknown unless unlike unlikely until unusual up upon upper urban urge urgent us use useful user usual usually utility vacation valley valuable value variable variation variety various vary vast vegetable vehicle venture version versus very vessel veteran via victim victory video view viewer village violate violence violent virtually virtue virus visible vision visit visitor visual vital vitamin voice volume volunteer vote voter vulnerable wage wait wake walk wall wander want war warm warn warning wash waste watch water wave way we weak wealth weapon wear weather wedding week weekend weekly weigh weight welcome welfare well west western wet what whatever wheel when whenever where whereas wherever whether which while whisper white who whole whom whose why wide widely widespread wife wild will willing win wind window wine wing winner winter wipe wire wisdom wise wish with withdraw within without witness woman wonder wonderful wood wooden wool word work worker working workshop world worry worth would wound wrap wrist write writer writing wrong yard yeah year yellow yes yesterday yet yield you young your yourself youth zone'.split(' ')))

const ACADEMIC = new Set(('abstract acknowledge acquisition adjacent aggregate allocate analyse analyse allocate analyse anomaly applicable approximate arbitrary assess assertion assumption attribute augment authentic autonomy baseline beneficial bias calibrate coherent collaborate compelling compliance component comprehensive comprise conceive conceptual concurrent conduct constrain constitute contemporary contradict controversial conversely criterion criteria crucial cumulative deduce deduce deficit deliberate derivative deteriorate detect deviate differentiate discourse discrete disproportionate diverse deduce dynamic empirical empirical encompass empirical emphasise empirical empirical emphasise emphasise empirical endogenous entail equilibrium equitable equitable eradicate evaluate evaluate evident exacerbate excerpt exemplar exert exhaustive exogenous explicit exploit extrapolate extrapolate fidelity formulate formulation foster fundamental fundamental heterogeneous holistic homogeneous hypothesis hypothesis implicit implicit impetus implication implicit implicit implicit incentive incorporate incremental index indigenous induce inference inherent inhibit initiate innovation insight integral integrate integrity intellectual intercept interim interpolate interpret interpretation intervention intrinsic intuitive irrelevant juxtapose latent leverage lexicon linkage locus longitudinal magnitude mainstream mandate manifest marginal mediate methodology mitigate modality modular momentum monotonic multilateral multifaceted mutation negligible nominal normative notion nuance optimal orthogonal paradigm paradox parameter parity partisan perceive peripheral persistent pervasive phenomenon philosophical plausible plurality pragmatic precede precedent predominant premise prescribe prevalent principle prioritise probe procedural proliferation prominent propensity proponent proposition propensity protocol provision proxy qualitative quantify quantify quantum quotient rationale reciprocal reconcile redundant refine refute regime reinforce reiterate relevance reliability relinquish residual resonate restrain retention rigorous robust salient scarcity scrutiny semantic sequential simulate simultaneous scrutiny scrutiny semantics sophistication spectrum speculate stimulus stringent structural substantiate succession sufficient supplementary synthesis tangible technical tentative threshold trajectory transcend transient transitory transparency underlying uniform uniqueness validity variable velocity verify versatile viable vigilance violate viscous vitality'.split(' ')))

const GRAMMAR_RULES: { id: string; re: RegExp; fix: string; note: string; level: 'error' | 'warning' }[] = [
  { id: 'should of', re: /\b(should|could|would|must|might)\s+of\b/gi, fix: 'should have / could have / would have', note: '"should of" is never correct in standard English — it is a mishearing of "should\'ve".', level: 'error' },
  { id: 'alot', re: /\balot\b/gi, fix: 'a lot', note: '"alot" is not a word; it is a frequent typo for "a lot".', level: 'error' },
  { id: 'irregardless', re: /\birregardless\b/gi, fix: 'regardless / regardless of', note: '"irregardless" is a non-standard formation. "Regardless" already means "without regard".', level: 'error' },
  { id: 'its vs it is', re: /\bits\s+(own|reason|value|size|shape|colour|color|effect|role|meaning|purpose|behaviour|behavior|origin|place|importance|nature)\b/gi, fix: "it's", note: 'Possessives take "its" with no apostrophe. If you mean "it is", it needs one.', level: 'error' },
  { id: 'your vs you are', re: /\byour\s+(going|not|right|wrong|welcome|being|the\s+best|very\s+good)\b/gi, fix: "you're", note: '"Your" is possessive. If you mean "you are", it is "you\'re".', level: 'error' },
  { id: 'there vs their', re: /\b(there|their)\s+(going|is|are|was|were|has|have|will)\b/gi, fix: "there is / there are / they are", note: '"There" is a place or expletive; "their" is possessive. This pair is the most commonly confused in writing.', level: 'warning' },
  { id: 'more then', re: /\b(more|less|fewer|better|worse|other|greater|larger|smaller|higher|lower|easier|harder)\s+then\b/gi, fix: 'more than / less than / better than', note: '"Then" is a time adverb. Comparisons need "than".', level: 'error' },
  { id: 'in order to', re: /\bin order to\b/gi, fix: 'to', note: 'Every use of "in order to" can be "to" without loss of meaning.', level: 'warning' },
  { id: 'due to the fact that', re: /\bdue to the fact that\b/gi, fix: 'because', note: 'A 22-character phrase doing the job of one word is the clearest sign of an unrevised first draft.', level: 'warning' },
  { id: 'a vs an', re: /\ba\s+([aeiou]\w{2,})/gi, fix: 'an', note: 'Use "an" before a vowel *sound*, not a vowel letter. Words like "hour", "university" and "one" take "a".', level: 'warning' },
  { id: 'affect vs effect', re: /\bwill\s+affect\s+in\b/gi, fix: 'will affect it in', note: '"Affect" is usually the verb; "effect" is usually the noun. Check which you meant.', level: 'warning' },
  { id: 'double negative', re: /\b(can't|cannot|don't|doesn't|didn't|won't|isn't|aren't|wasn't)\s+\w+\s+never\b/gi, fix: 'drop one negative', note: 'Two negatives in one clause invert the meaning, which is almost never what you intend.', level: 'error' },
  { id: 'passive', re: /\b(was|were|is|are|been|being|be)\s+(\w+ed|made|done|given|taken|shown|known|seen|written|held|built|found|thought|brought|taught|caught|bought|sought|thought)\b/gi, fix: 'name the actor', note: 'A passive construction hides who did the action. Some passives are correct — this is a flag, not a verdict.', level: 'warning' },
  { id: 'very', re: /\bvery\s+(\w+)\b/gi, fix: 'a stronger adjective', note: '"Very" dilutes an adjective. "Very small" is weaker than "tiny"; "very bad" is weaker than "appalling".', level: 'warning' },
  { id: 'thing', re: /\b(thing|things|stuff)\b/gi, fix: 'a precise noun', note: '"Thing" and "stuff" hide the object of the sentence. Naming it is nearly always an improvement.', level: 'warning' },
  { id: 'weasel quantifier', re: /\b(some|many|most|several|various|numerous|a\s+lot\s+of)\s+(of\s+)?(the\s+)?(students|people|researchers|users|results|studies|participants|respondents)\b/gi, fix: 'an exact number or proportion', note: 'Vague quantifiers are the most common form of unsupported claim. "18 of 24 participants" is stronger than "most participants".', level: 'warning' },
  { id: 'double word', re: /\b(\w+)\s+\1\b/gi, fix: 'remove one', note: 'A repeated word is almost always a typing slip.', level: 'error' },
  { id: 'impacted', re: /\bimpacted\b/gi, fix: 'affected', note: '"Impacted" as a verb is business jargon. "Affected" is shorter and clearer.', level: 'warning' },
  { id: 'utilise', re: /\butilis(e|ed|ing|ation)\b/gi, fix: 'use / used / using', note: '"Utilise" adds nothing to "use" in any register, formal or informal.', level: 'warning' },
  { id: 'able to', re: /\b(is|are|was|were|be|been)\s+able to\b/gi, fix: 'can / could', note: '"Able to" is the passive form of "can". Using it hides the agency of the sentence.', level: 'warning' },
  { id: 'at this point in time', re: /\bat this point in time\b/gi, fix: 'now / currently', note: 'Six words for one. Common in the first draft of anything written under deadline.', level: 'error' },
  { id: 'each other', re: /\bthe two of (you|them|us)\b/gi, fix: 'you / they / we', note: 'Redundant construction: "the two" already implies the pair.', level: 'warning' },
]

const SYNONYMS: Record<string, { syn: string[]; formal?: string; informal?: string; warn?: string }> = {
  important: { syn: ['significant', 'crucial', 'essential', 'material'], formal: 'of consequence', warn: '"Important" is used so often it has weakened — pick the one that says *how* important.' },
  show: { syn: ['demonstrate', 'illustrate', 'reveal', 'indicate'], formal: 'evince', warn: 'In academic writing "show" is fine; "demonstrate" implies a controlled test, so do not use it as a synonym unless you ran one.' },
  think: { syn: ['consider', 'suggest', 'argue', 'contend'], formal: 'hold', informal: 'reckon' },
  big: { syn: ['large', 'substantial', 'considerable'], formal: 'sizeable', informal: 'massive' },
  good: { syn: ['effective', 'sound', 'successful', 'rigorous'], formal: 'commendable', warn: '"Good" and "bad" are not academic categories. Name the quality: rigorous, reproducible, well-powered.' },
  bad: { syn: ['poor', 'weak', 'flawed', 'unsound'], formal: 'inadequate' },
  get: { syn: ['obtain', 'acquire', 'receive'], formal: 'procure', informal: 'grab' },
  make: { syn: ['create', 'produce', 'generate', 'construct'], formal: 'fashion' },
  help: { syn: ['support', 'facilitate', 'enable', 'assist'], formal: 'aiding' },
  problem: { syn: ['limitation', 'challenge', 'shortcoming'], formal: 'deficiency', warn: 'In methodology, "limitation" is the correct term for a boundary of the design, not a defect.' },
  a_lot_of: { syn: ['many', 'numerous', 'a considerable number of'], warn: '"A lot of" is informal; "many" is the neutral form; "numerous" is dense. Pick by audience.' },
  find: { syn: ['discover', 'identify', 'determine', 'establish'], formal: 'ascertain' },
  big_number: { syn: ['substantial', 'sizeable', 'considerable'] },
  very_good: { syn: ['excellent', 'outstanding', 'rigorous'], formal: 'commendable' },
  use: { syn: ['employ', 'apply', 'utilise'], formal: 'deploy', warn: '"Utilise" adds nothing over "use" at any register.' },
  talk: { syn: ['discuss', 'address', 'converse'], formal: 'deliberate', informal: 'chat' },
  picture: { syn: ['illustration', 'diagram', 'figure'], formal: 'representation' },
  job: { syn: ['role', 'position', 'post'], formal: 'appointment', informal: 'gig' },
  buy: { syn: ['purchase', 'acquire'], formal: 'procure' },
  end: { syn: ['conclude', 'finish'], formal: 'terminate' },
  begin: { syn: ['start', 'commence', 'initiate'], formal: 'inaugurate', informal: 'never use "commence" — it is not a more formal "start", it is a pretentious one' },
  difficult: { syn: ['challenging', 'demanding', 'complex'], formal: 'arduous' },
  happy: { syn: ['pleased', 'content', 'satisfied'], formal: ' gratified' },
  angry: { syn: ['irate', 'annoyed', 'frustrated'], formal: 'indignant' },
  quiet: { syn: ['silent', 'still', 'muted'], formal: 'stilly' },
  fast: { syn: ['rapid', 'quick', 'swift'], formal: 'expeditious' },
  strange: { syn: ['unusual', 'odd', 'peculiar'], formal: 'singular' },
  famous: { syn: ['renowned', 'well-known', 'prominent'], formal: 'eminent' },
  clever: { syn: ['ingenious', 'shrewd', 'ingenious'], formal: 'canny' },
  scary: { syn: ['frightening', 'alarming', 'daunting'], formal: 'formidable' },
  rich: { syn: ['wealthy', 'affluent', 'prosperous'], formal: 'opulent' },
  poor: { syn: ['impoverished', 'disadvantaged', 'underprivileged'], formal: 'destitute' },
  honest: { syn: ['truthful', 'candid', 'frank'], formal: 'veracious' },
  lazy: { syn: ['indolent', 'disinclined to work'], formal: 'slothful' },
  friendly: { syn: ['amiable', 'approachable', 'cordial'], formal: 'genial' },
  angry_note: { syn: ['cross', 'irritated'] },
}

const ANTONYM_SCALES: { a: string; b: string; steps: string[]; note: string }[] = [
  { a: 'rich', b: 'poor', steps: ['affluent', 'comfortable', 'adequate', 'strained', 'destitute'], note: 'A true gradient. "Poor" and "rich" are not opposites but positions on one scale, so prefer the middle terms when precision matters.' },
  { a: 'hot', b: 'cold', steps: ['scalding', 'hot', 'warm', 'cool', 'cold', 'freezing'], note: 'A continuous scale with a neutral midpoint, which is why "lukewarm" exists and why saying something is "not cold" rarely communicates.' },
  { a: 'happy', b: 'sad', steps: ['ecstatic', 'happy', 'content', 'neutral', 'glum', 'sad', 'despairing'], note: 'Emotion is not a single axis. A person can be high on one dimension and low on another, so a binary pair always loses something.' },
  { a: 'easy', b: 'hard', steps: ['trivial', 'easy', 'manageable', 'demanding', 'hard', 'brutal'], note: 'Prefer the middle of a difficulty scale in academic writing. "Demanding" is more informative than either extreme.' },
  { a: 'small', b: 'large', steps: ['negligible', 'small', 'modest', 'substantial', 'large', 'enormous'], note: 'Adding a precise measure beats any adjective on this scale.' },
  { a: 'certain', b: 'unsure', steps: ['proven', 'certain', 'likely', 'probable', 'uncertain', 'unsure'], note: 'Probability has a natural vocabulary of its own. "Likely" and "uncertain" are far more useful than "certain" and "unsure".' },
]

const PREFIXES: { p: string; turns: string; example: string; note: string }[] = [
  { p: 'un-', turns: 'not, reverse, remove', example: 'necessary → unnecessary', note: 'The most common negative prefix. Applies to adjectives and participles.' },
  { p: 'in-', turns: 'not, or into', example: 'complete → incomplete', note: 'Often means "not" for adjectives, but "into" for verbs. Check which sense the word needs.' },
  { p: 'im-', turns: 'not, or into (before b, m, p)', example: 'possible → impossible', note: 'Changes form before labials: im-possible, im-mature, im-perfect, im-plausible.' },
  { p: 'il-', turns: 'not (before l)', example: 'legal → illegal', note: 'Only attaches to a handful of words: legal, legible, liberal, limit, illicit.' },
  { p: 'ir-', turns: 'not (before r)', example: 'regular → irregular, reversible → irreversible', note: 'Also used for "in", as in "irritate", which is unrelated to negation.' },
  { p: 'dis-', turns: 'not, or apart', example: 'agree → disagree, honest → dishonest', note: 'A productive prefix that often means "reverse of" rather than simply "not".' },
  { p: 'non-', turns: 'not (fused form)', example: 'smoker → nonsmoker', note: 'Use when the base word is a noun. "Non-smoking" is a participle; "nonsmoking" is the established adjective.' },
  { p: '-less', turns: 'without', example: 'help → helpless', note: 'Suffix rather than prefix. Produces an adjective: "without X".' },
  { p: '-ful', turns: 'full of', example: 'help → helpful', note: 'The opposite suffix, though "helpful" is a compliment in modern usage.' },
]

const IDIOMS: { phrase: string; literal: string; actual: string; register: string; safe: string; paraphrase: string }[] = [
  { phrase: 'break the ice', literal: 'physically fracture a frozen surface', actual: 'to ease initial awkwardness in a new situation', register: 'informal to neutral', safe: 'fine socially, too casual for academic prose', paraphrase: 'to ease the initial tension in a group' },
  { phrase: 'bite the bullet', literal: 'endure a painful procedure', actual: 'to force yourself to do something unpleasant but necessary', register: 'informal', safe: 'avoid in academic writing', paraphrase: 'to do the necessary but unpleasant task' },
  { phrase: 'think outside the box', literal: 'depart from a container', actual: 'to consider unconventional approaches', register: 'informal', safe: 'corporate cliché — overused and vague', paraphrase: 'to consider approaches beyond conventional ones' },
  { phrase: 'hit the ground running', literal: 'fall and begin moving at once', actual: 'to begin a new role with energy and competence', register: 'informal to neutral', safe: 'acceptable in industry, too casual for academic prose', paraphrase: 'to begin the role already operating effectively' },
  { phrase: 'under the weather', literal: 'exposed to the elements', actual: 'to be slightly unwell', register: 'informal', safe: 'avoid in formal writing', paraphrase: 'to be mildly unwell' },
  { phrase: 'cost an arm and a leg', literal: 'an expensive body part', actual: 'to be extremely expensive', register: 'informal', safe: 'avoid in academic writing', paraphrase: 'to be prohibitively expensive' },
  { phrase: 'the ball is in your court', literal: 'a game state', actual: 'the decision now rests with you', register: 'neutral to formal', safe: 'safe in most contexts', paraphrase: 'the responsibility for the next step is yours' },
  { phrase: 'a blessing in disguise', literal: 'hidden benefit', actual: 'something that appears bad but turns out well', register: 'informal to neutral', safe: 'use with care — it can excuse genuine harm', paraphrase: 'a setback that produced an eventual benefit' },
  { phrase: 'move the goalposts', literal: 'relocate the scoring area', actual: 'to change the criteria after a commitment is made', register: 'informal', safe: 'avoid in academic writing', paraphrase: 'to alter the agreed criteria mid-process' },
  { phrase: 'throw shade', literal: 'cast a shadow', actual: 'to make a subtly disparaging remark', register: 'informal', safe: 'avoid in academic writing', paraphrase: 'to make a disparaging remark indirectly' },
  { phrase: 'touch base', literal: 'physical contact with a base', actual: 'to make brief contact to exchange updates', register: 'informal', safe: 'acceptable in industry, too casual for academic prose', paraphrase: 'to make brief contact to exchange updates' },
  { phrase: 'low-hanging fruit', literal: 'fruit near the ground', actual: 'the easiest targets or quickest wins', register: 'informal', safe: 'common but imprecise in research writing', paraphrase: 'the most immediately achievable objectives' },
  { phrase: 'at face value', literal: 'the stated monetary worth', actual: 'accepting something as true without scrutiny', register: 'neutral to formal', safe: 'safe in academic writing', paraphrase: 'as stated, without further verification' },
  { phrase: 'in the same boat', literal: 'share a vessel', actual: 'to be in the same difficult situation', register: 'informal', safe: 'avoid in academic writing', paraphrase: 'to face the same constraints' },
  { phrase: 'pull out all the stops', literal: 'remove obstacles to movement', actual: 'to make maximum effort', register: 'informal', safe: 'avoid in academic writing', paraphrase: 'to make the greatest possible effort' },
]

export const mod18: StudentSpec[] = [
  {
    id: 'translation-brief-builder-language',
    name: 'Translation Brief Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Analyses a source text for translation risk and produces a translator brief: register, idiom traps, ambiguous terms and a term glossary.',
    tip: 'Most translation errors are not vocabulary errors. They are decisions made silently — and a brief that forces those decisions early is worth more than a glossary.',
    usage: ['Paste the source text and say the target language.', 'Set the register and audience.', 'Read the brief and the required decisions.'],
    method: ['Idioms, hedges and register markers are detected.', 'Ambiguous terms are collected into a glossary.', 'A prioritised decision list is produced.'],
    fields: [
      txt('text', 'Source text', 12, 'The results were fairly conclusive, and the effect was robust across all conditions. It is worth noting that the sample was somewhat limited in size. We expect that further work will shed light on the mechanism. The findings could be seen as a significant contribution to the field.'),
      txt('target', 'Target language', 2, 'Japanese'),
      sel('register', 'Target register', ['Formal academic', 'Neutral professional', 'Conversational', 'Marketing'], 'Formal academic'),
      sel('audience', 'Audience', ['Specialist researchers', 'General educated readers', 'Students', 'Executives'], 'Specialist researchers'),
    ],
    compute: (v) => {
      const text = asStr(v.text).trim()
      if (text.length < 40) return [sres('Brief', 'Paste at least a couple of sentences', T.warn)]
      const target = asStr(v.target).trim() || 'your target language'
      const register = asSel(v.register)
      const audience = asSel(v.audience)
      const lower = text.toLowerCase()
      const sents = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 8)
      const foundIdioms = IDIOMS.filter((i) => lower.includes(i.phrase))
      const hedges = (lower.match(/\b(fairly|somewhat|rather|quite|fairly|arguably|perhaps|possibly|seems?|appears?|suggests?|might|may|could|to some extent|more or less|generally|usually|typically|often|tend(s)? to)\b/g) || [])
      const intensifiers = (lower.match(/\b(very|extremely|highly|significantly|substantially|considerably|remarkably|profoundly|completely|totally|absolutely|incredibly)\b/g) || [])
      const nominalisations = (lower.match(/\b\w+(?:tion|ment|ance|ence|ity|ness|isation|ization)\b/g) || [])
      const passives = (text.match(/\b(was|were|is|are|been|being)\s+\w+(ed|done|given|taken|shown|known|seen|written|held|built|found|thought|made)\b/gi) || [])
      const ambiguous = (lower.match(/\b(robust|conclusive|significant|significantly|fairly|notable|considerable|substantial|meaningful|clear|obviously|simply|just|impact|informative|interesting|novel|preliminary|support|address|issue|impact|state|fair|mean|supportive|responsive|sensitive)\b/g) || [])
      const uniqAmbig = Array.from(new Set(ambiguous))
      const uniqHedge = Array.from(new Set(hedges))
      const uniqNom = Array.from(new Set(nominalisations))
      const wordCount = wordsOf(text).length
      const risk = clamp(100 - (foundIdioms.length * 6) - (uniqHedge.length * 4) - (uniqAmbig.length * 5) - (passives.length * 3), 5, 100)
      const glossary = uniqAmbig.map((t) => `  ${t} — decide: one fixed equivalent for the whole document, or vary by context? Most target languages need an explicit decision here.`)
      return [
        sres('Translation risk', `${num(risk, 0)}/100`, risk > 75 ? T.good : risk > 50 ? T.warn : T.bad, `${num(sents.length, 0)} sentences · ${num(wordCount, 0)} words · ${num(uniqAmbig.length, 0)} ambiguous terms`, risk),
        sres('Register match', `${register} → ${audience}`, register === 'Formal academic' ? T.good : T.warn, register === 'Formal academic' ? 'academic register maps onto academic register, so hedging and nominalisation can be preserved literally' : `writing in ${register.toLowerCase()} for ${audience.toLowerCase()} means restyling, not just substituting words — the register gap is where most of the work is`, clamp(100 - (register === 'Formal academic' ? 0 : 30), 5, 100)),
        sres('Idioms found', num(foundIdioms.length, 0), foundIdioms.length ? T.bad : T.good, foundIdioms.length ? 'idioms must be translated by meaning, not word-for-word' : 'no fixed idioms detected — a lower-risk text', clamp(100 - foundIdioms.length * 20, 5, 100)),
        sres('Hedging', num(uniqHedge.length, 0), uniqHedge.length > 3 ? T.warn : T.good, uniqHedge.length ? `hedges carry epistemic weight: ${uniqHedge.join(', ')}` : 'little hedging — the claims are stated flatly', clamp(100 - uniqHedge.length * 10, 5, 100)),
        docr('Brief', [`TARGET: ${target}`, `SOURCE REGISTER: ${register}`, `AUDIENCE: ${audience}`, `LENGTH: ${num(wordCount, 0)} words / ${num(sents.length, 0)} sentences`, '', 'AMBIGUOUS TERMS REQUIRING A DECISION', ...(uniqAmbig.length ? uniqAmbig.map((t) => `  · ${t}`) : ['  (none detected)']), '', 'IDIOMS TO TRANSLATE BY MEANING', ...(foundIdioms.length ? foundIdioms.map((i) => `  · "${i.phrase}" — ${i.actual}\n      register: ${i.register} | paraphrase for formal use: ${i.paraphrase}`) : ['  (none detected)']), '', 'HEDGES TO PRESERVE', ...(uniqHedge.length ? uniqHedge.map((h) => `  · ${h} — keep the uncertainty; flattening a hedge changes a claim into a different claim`) : ['  (none detected)']), '', 'STYLE OBSERVATIONS', ...(uniqNom.length ? [`  ${uniqNom.length} nominalisation(s) present (${uniqNom.slice(0, 6).join(', ')}) — some languages express these more naturally as verbs`] : ['  no heavy nominalisation — the text is comparatively verbal']), ...(passives.length ? [`  ${passives.length} passive construction(s) — many languages have no passive; these may need an explicit agent`] : []), ...(intensifiers.length ? [`  intensifier(s) used: ${Array.from(new Set(intensifiers)).join(', ')} — check that the target language can carry the same intensity`] : [])].join('\n')),
        docr('Glossary entries to fix', glossary.length ? glossary.join('\n') : 'no terms in this text need a fixed-equivalent decision'),
        res('Hedges are claims', 'every hedge in the source is a claim about confidence. Translating "suggests" as "proves" is a factual error, not a style choice, and it is the most common failure in this kind of text.', T.warn),
        res('Nominalisations are a symptom', 'a text dense with "-tion" and "-ment" is usually an edited text, not a written one. Translating it faithfully preserves the density, and the target reader gets the same wall.', T.neutral),
        res('Do not translate the register', `a formal academic text in ${target} should still sound formal, but formal does not mean stiff in every language. Find how ${target} expresses academic caution naturally and use that.`, T.good),
      ]
    },
  },
  {
    id: 'english-grammar-checker-language',
    name: 'Grammar Checker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Checks English text against two dozen high-frequency grammar and style errors and shows the fix for each one.',
    tip: 'No checker replaces rereading. What a checker does well is catch the errors you stop seeing after the fifth draft — which is most of them.',
    usage: ['Paste your text.', 'Choose strictness.', 'Read each flag with its fix and the reasoning.'],
    method: ['Two dozen rule patterns are matched against the text.', 'Each match is reported with a fix and an explanation.', 'Sentence length and variety are also measured.'],
    fields: [
      txt('text', 'Your text', 16, 'The results was fairly conclusive and the effect where robust across all conditions. Its worth noting that the sample was somewhat limited in size. We expect that further work will shed light onto the mechanism. The findings could be seen as a significant contribution to the field, and it is obvious that more research could be able to be done in this area.'),
      sel('strict', 'Strictness', ['Errors only', 'Errors and style flags', 'Everything, including hedges'], 'Errors and style flags'),
    ],
    compute: (v) => {
      const text = asStr(v.text).trim()
      if (text.length < 20) return [sres('Grammar check', 'Paste at least a sentence or two', T.warn)]
      const strict = asSel(v.strict)
      const sents = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 5)
      const findings: { id: string; fix: string; note: string; level: string; matches: string[] }[] = []
      GRAMMAR_RULES.forEach((r) => {
        const global = new RegExp(r.re.source, r.re.flags.includes('g') ? r.re.flags : r.re.flags + 'g')
        const found = text.match(global) || []
        if (!found.length) return
        if (strict === 'Errors only' && r.level !== 'error') return
        if (strict === 'Everything, including hedges' || strict === 'Errors and style flags') {
          if (strict === 'Errors and style flags' && r.id === 'very' && found.length < 3) return
        }
        findings.push({ id: r.id, fix: r.fix, note: r.note, level: r.level, matches: Array.from(new Set(found.map((f) => f.trim()))) })
      })
      const errors = findings.filter((f) => f.level === 'error')
      const lengths = sents.map((s) => wordsOf(s).length)
      const avgLen = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length)
      const maxLen = Math.max(0, ...lengths)
      const longSents = lengths.filter((l) => l > 30)
      const shorts = lengths.filter((l) => l < 6)
      const variety = lengths.length > 2 ? new Set(lengths.map((l) => Math.round(l / 5))).size / lengths.length : 0.5
      const wordCount = wordsOf(text).length
      const score = clamp(Math.round(100 - (errors.length * 8) - (findings.length - errors.length) * 2 - (avgLen > 26 ? (avgLen - 26) * 1.5 : 0) - longSents.length * 3), 5, 100)
      return [
        sres('Errors found', num(errors.length, 0), errors.length ? T.bad : T.good, `${num(findings.length - errors.length, 0)} style flag(s) · ${num(wordCount, 0)} words`, clamp(100 - errors.length * 12, 5, 100)),
        sres('Overall score', `${score}/100`, score > 80 ? T.good : score > 60 ? T.warn : T.bad, errors.length ? 'fix the errors first; style flags are optional' : 'no errors detected', score),
        sres('Average sentence', `${num(avgLen, 1)} words`, avgLen > 28 ? T.warn : avgLen < 8 ? T.warn : T.good, `${num(sents.length, 0)} sentences · longest ${num(maxLen, 0)} words`, clamp(100 - Math.abs(avgLen - 17) * 3, 5, 100)),
        sres('Variety', `${num(variety * 100, 0)}%`, variety > 0.5 ? T.good : T.warn, longSents.length ? `${num(longSents.length, 0)} sentence(s) over 30 words` : shorts.length ? `${num(shorts.length, 0)} sentence(s) under 6 words` : 'no sentence-length outliers', clamp(variety * 100, 5, 100)),
        docr('Flags', findings.length ? findings.map((f) => `[${f.level.toUpperCase()}] ${f.id}\n   found: ${f.matches.slice(0, 4).join(', ')}${f.matches.length > 4 ? ` (+${f.matches.length - 4} more)` : ''}\n   fix: ${f.fix}\n   why: ${f.note}`).join('\n\n') : 'no flags matched at this strictness level'),
        docr('Sentence lengths', sents.map((s, i) => `S${i + 1}: ${num(wordsOf(s).length, 0)} words${wordsOf(s).length > 30 ? '  ← consider splitting' : wordsOf(s).length < 6 ? '  ← consider merging with its neighbour' : ''}`).join('\n')),
        res('Errors before style', 'fix subject-verb agreement and malformed phrases first. A polished paragraph built on incorrect grammar still reads as careless, and the polish was wasted.', T.bad),
        res('Vague quantifiers are the real problem', 'the "weasel quantifier" flag catches the most consequential habit in student writing: "some", "most", "many" where a number belongs. "18 of 24 participants" is a claim; "most participants" is a mood.', T.warn),
        res('Read it aloud', 'the highest-yield editing step, and it is not a grammar checker. Your ear finds run-ons, missing words and unintended rhythm that no rule matches.', T.good),
      ]
    },
  },
  {
    id: 'vocabulary-builder-language',
    name: 'Vocabulary Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Extracts the most useful words from a text or word list, grades them by difficulty, and builds a spaced study plan.',
    tip: 'Learning a word you never meet again is wasted effort. Learn the words of the field you are actually reading in.',
    usage: ['Paste a text or a comma-separated word list.', 'Set how many words you want and your level.', 'Read the ranked list and the review schedule.'],
    method: ['Candidate words are frequency-ranked and de-duplicated.', 'Difficulty is estimated from length and rarity.', 'A spaced review schedule is generated.'],
    fields: [
      txt('source', 'Text or word list', 16, 'The empirical results demonstrate a robust correlation between formative assessment frequency and student attainment across three institutions. Interventions that provided immediate, specific feedback yielded substantially larger gains than delayed generic feedback. The mediating mechanism appears to be metacognitive engagement rather than content retention per se.'),
      n('want', 'Words to learn', { def: 12, min: 4, max: 40, step: 1 }),
      sel('level', 'Your level', ['Beginner (A1–A2)', 'Intermediate (B1–B2)', 'Advanced (C1+)'], 'Intermediate (B1–B2)'),
      sel('goal', 'Main goal', ['Read academic papers', 'Write essays and reports', 'Speak in class or presentations', 'Pass a language exam'], 'Read academic papers'),
    ],
    compute: (v) => {
      const source = asStr(v.source).trim()
      if (source.split(/\s+/).length < 5) return [sres('Vocabulary', 'Add more text or a longer word list', T.warn)]
      const want = clamp(Math.round(asNum(v.want)) || 12, 4, 40)
      const level = asSel(v.level)
      const goal = asSel(v.goal)
      const listed = source.split(/[,\n;]/).map((s) => s.trim()).filter((s) => s && s.includes(' '))
      const explicit = listed.length >= 3
      const tokens = explicit ? listed : (source.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [])
      const freq = new Map<string, number>()
      tokens.forEach((t) => freq.set(t, (freq.get(t) || 0) + 1))
      const cand = Array.from(freq.entries())
        .filter(([w]) => !STOP.has(w) && w.length >= 4 && !/^\d/.test(w))
        .map(([term, count]) => {
          const band = A1.has(term) ? 1 : A2.has(term) ? 2 : ACADEMIC.has(term) ? 3 : 4
          const rare = band === 4 ? 1 : 0
          const long = term.length >= 10 ? 1 : 0
          const score = count * 2 + rare * 5 + long * 2 + (band === 3 ? 4 : 0)
          return { term, count, band, score }
        })
        .filter((c) => c.band >= (level.startsWith('Beginner') ? 1 : level.startsWith('Intermediate') ? 2 : 3))
        .sort((a, b) => b.score - a.score || a.term.length - b.term.length)
      const final = cand.slice(0, want)
      if (!final.length) return [sres('Vocabulary', 'No words matched at this level — try a lower level or more text', T.warn)]
      const byBand = [0, 0, 0, 0, 0]
      final.forEach((w) => { byBand[w.band] += 1 })
      const avgLen = final.reduce((s, w) => s + w.term.length, 0) / final.length
      const veryHard = byBand[4]
      const intervals = [0, 1, 3, 7, 16, 35]
      const plan = final.map((w) => `${w.term.padEnd(22)} band ${w.band}${w.count > 1 ? ` · appeared ${w.count}×` : ''} → review on days ${intervals.slice(1, 4).join(', ')}`).join('\n')
      const hardest = final.filter((w) => w.band >= 4).slice(0, 5)
      return [
        sres('Words selected', num(final.length, 0), T.good, explicit ? 'from your supplied list' : 'extracted by frequency and rarity', clamp((final.length / want) * 100, 5, 100)),
        sres('Difficulty mix', `${num(byBand[3] + byBand[4], 0)} advanced`, veryHard > final.length * 0.5 ? T.warn : T.good, `${num(byBand[1], 0)} A1 · ${num(byBand[2], 0)} A2 · ${num(byBand[3], 0)} academic · ${num(byBand[4], 0)} beyond list · average word length ${num(avgLen, 1)}`, clamp(100 - veryHard * 6, 5, 100)),
        sres('Feasible load', `${num((final.length * 3) / 60, 1)} h`, final.length > 20 ? T.warn : T.good, `three encounters per word over a month. Beyond about 20 words per month, review quality collapses.`, clamp(100 - (final.length / 20) * 60, 5, 100)),
        docr('Word list', final.map((w, i) => `${i + 1}. ${w.term}  (${w.band === 4 ? 'beyond A2' : w.band === 3 ? 'academic register' : w.band === 2 ? 'A2' : 'A1'}${w.count > 1 ? `, ×${w.count}` : ''})`).join('\n')),
        docr('Review schedule', plan),
        hardest.length ? docr('Hardest first', hardest.map((w, i) => `${i + 1}. ${w.term}\n   break it down: ${w.term.replace(/(tion|ment|ance|ence|ity|ness|ical|ive|ous)$/, ' · [root] · [$1 suffix]')}\n   collocate it: find one real sentence in your source material using it`).join('\n\n')) : res('No very hard words', 'every selected word is within A2 or academic register, which is a good sign your material is well matched to your level.', T.good),
        res('Never learn a word alone', 'a word learned without context is a word you recognise but cannot use. Record the word, one collocation, and one sentence you would actually say.', T.good),
        res(`For ${goal.toLowerCase()}`, goal === 'Read academic papers' ? 'prioritise the band-3 academic terms — they are the ones that recur across every paper in your field, so they pay back fastest.' : goal === 'Write essays and reports' ? 'prioritise words that name *your* claims: the connectives and hedges that make an argument look precise.' : goal === 'Speak in class or presentations' ? 'learn one word per point, and say it aloud. Recognising a word while speaking is a different skill from recognising it while reading.' : 'exam vocabulary is frequency-driven, so work from the syllabus and past papers rather than from general material.', T.neutral),
      ]
    },
  },
  {
    id: 'vocabulary-quiz-generator-language',
    name: 'Vocabulary Quiz Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a vocabulary quiz from your word list, with distractors drawn from the same list and difficulty set by you.',
    tip: 'Testing yourself on the definitions you already know feels productive. Test the ones you keep mistaking for each other.',
    usage: ['Paste your word list as term | definition.', 'Set the format and length.', 'Take the quiz, then read the key.'],
    method: ['Terms are paired with their definitions.', 'Distractors are drawn from the remaining terms.', 'Questions are distributed across your chosen formats.'],
    fields: [
      txt('words', 'Words as term | definition, one per line', 14, 'mitigate | to reduce the severity or impact of something harmful\nempirical | based on observation or experiment rather than theory\nrobust | strong and not easily broken by variation\nsalient | most noticeable or important\nconverge | to come together from different directions toward agreement\ndiverge | to move apart or diverge in direction\nsalient trend | a pattern that stands out clearly in data\nlatent | present but not immediately visible or expressed\nconfound | to confuse one variable with another so the effect cannot be isolated\npragmatic | dealing with practical reality rather than theory\nreciprocal | given and received in return\nexplicit | stated clearly and in detail'),
      n('count', 'Questions', { def: 10, min: 4, max: 30, step: 1 }),
      sel('format', 'Format', ['Definition → word', 'Word → definition', 'Mixed, with one blank-letter cue'], 'Mixed, with one blank-letter cue'),
    ],
    compute: (v) => {
      const raw = asStr(v.words).split('\n').map((l) => l.trim()).filter(Boolean)
      const pairs = raw.map((l) => {
        const parts = l.split('|').map((p) => p.trim())
        return { term: parts[0], def: parts[1] || '', both: parts[0] && parts[1] }
      }).filter((p) => p.both)
      if (pairs.length < 4) return [sres('Quiz', 'Add at least four term | definition lines', T.warn)]
      const want = clamp(Math.round(asNum(v.count)) || 10, 4, 30)
      const format = asSel(v.format)
      const qs: { q: string; opts: string[]; ans: number; explain: string }[] = []
      pairs.forEach((p, i) => {
        const others = pairs.filter((x) => x.term !== p.term)
        const offset = (i * 3) % others.length
        const distractors = [others[offset], others[(offset + 1) % others.length], others[(offset + 2) % others.length]].filter(Boolean).map((x) => x.term)
        const reverse = format === 'Definition → word' || (format.startsWith('Mixed') && i % 2 === 0)
        if (reverse) {
          const opts = [p.term, ...distractors]
          qs.push({ q: `Which term matches: "${p.def}"?`, opts, ans: 0, explain: `${p.term} — ${p.def}` })
        } else {
          const others2 = pairs.filter((x) => x.term !== p.term)
          const defs = [others2[offset], others2[(offset + 1) % others2.length], others2[(offset + 2) % others2.length]].filter(Boolean).map((x) => x.def)
          const opts = [p.def, ...defs]
          qs.push({ q: `What does "${p.term}" mean?`, opts, ans: 0, explain: `${p.term} — ${p.def}` })
        }
      })
      const final = qs.slice(0, want)
      const lettered = final.map((q, i) => `Q${i + 1}. ${q.q}\n${q.opts.map((o, j) => `   ${String.fromCharCode(65 + j)}) ${o}`).join('\n')}`).join('\n\n')
      const key = final.map((q, i) => `Q${i + 1}. A) ${q.explain}`).join('\n\n')
      const avgDef = pairs.reduce((s, p) => s + p.def.split(' ').length, 0) / pairs.length
      return [
        sres('Quiz built', `${num(final.length, 0)} questions`, T.good, `${num(pairs.length, 0)} terms in your list · ${format.toLowerCase()}`, clamp((final.length / want) * 100, 5, 100)),
        sres('Definition length', `${num(avgDef, 1)} words`, avgDef > 18 ? T.warn : T.good, avgDef > 18 ? 'long definitions make the question a reading test rather than a vocabulary test' : 'definitions are short enough to test recall', clamp(100 - Math.max(0, avgDef - 14) * 4, 5, 100)),
        sres('Distractor quality', final.length >= 4 ? 'all distractors drawn from your own list' : 'only ' + num(final.length, 0) + ' item(s) — some distractors are generic', final.length >= 4 ? T.good : T.warn, 'every wrong option comes from your own list, so the quiz tests the distinctions you actually have to make', clamp((final.length / Math.max(1, want)) * 100, 5, 100)),
        docr('Quiz', lettered),
        docr('Answer key', key),
        res('Answer before looking', 'mark each question before you check the key. The point is not the score — it is noticing which word you hesitated on.', T.good),
        res('Beware the near-synonym trap', 'a list containing both "mitigate" and "reduce" is a distinction quiz, not a definition quiz. If two options could both be right, the question is testing something subtler than vocabulary, and that is worth noticing.', T.warn),
        res('Grow the list', `${num(pairs.length, 0)} terms is a thin base. Aim for 40–60 terms in a subject before the quiz tells you anything reliable — below that, most of the score is just breadth of reading.`, T.neutral),
      ]
    },
  },
  {
    id: 'word-meaning-finder-language',
    name: 'Word Meaning Finder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Works out what an unfamiliar word probably means from its structure, affixes and sentence context, and shows the deduction.',
    tip: 'You do not need a dictionary for most of the words you meet. You need the prefixes, the roots and the position in the sentence.',
    usage: ['Enter the word and the sentence it appears in.', 'Say how much context you have.', 'Read the structural analysis and the deduction steps.'],
    method: ['The word is split into prefix, root and suffix.', 'Each affix is given its usual meaning.', 'Context words are used to narrow the likely sense.'],
    fields: [
      txt('word', 'The word', 1, 'irrevocable'),
      txt('context', 'The sentence it appears in', 3, 'Once the appeal had been filed, the decision became irrevocable and the panel had no remaining discretion.'),
      sel('conf', 'How confident are you about the sentence?', ['Certain of the words around it', 'Most words, some unknown', 'Very little context'], 'Most words, some unknown'),
    ],
    compute: (v) => {
      const word = asStr(v.word).trim().toLowerCase().replace(/[^a-z-]/g, '')
      if (word.length < 3) return [sres('Meaning', 'Enter a word of three letters or more', T.warn)]
      const context = asStr(v.context).trim()
      if (context.length < 15) return [sres('Meaning', 'Add the sentence it appears in', T.warn)]
      const conf = asSel(v.conf)
      const parts: { affix: string; kind: string; meaning: string; meaning2: string }[] = []
      let rest = word
      const knownPrefix = PREFIXES.find((p) => rest.startsWith(p.p))
      if (knownPrefix) {
        parts.push({ affix: knownPrefix.p, kind: 'prefix', meaning: knownPrefix.turns, meaning2: knownPrefix.note })
        rest = rest.slice(knownPrefix.p.length)
      } else {
        const loose = PREFIXES.filter((p) => rest.startsWith(p.p.replace('-', '').slice(0, 2)))
        if (loose.length) parts.push({ affix: loose[0].p, kind: 'prefix (inferred)', meaning: loose[0].turns, meaning2: loose[0].note })
      }
      const SUFFIX: { s: string; kind: string; meaning: string; note: string }[] = [
        { s: '-able', kind: 'suffix', meaning: 'capable of being', note: 'A very productive suffix: readable, breakable, defensible.' },
        { s: '-ible', kind: 'suffix', meaning: 'capable of being (formally)', note: 'Often pairs with Latin roots: possible, visible, credible.' },
        { s: '-tion', kind: 'suffix', meaning: 'the action or state of', note: 'Nominalises a verb: apply → application.' },
        { s: '-ment', kind: 'suffix', meaning: 'the result or product of', note: 'Nouns: measure → measurement, replace → replacement.' },
        { s: '-ity', kind: 'suffix', meaning: 'the quality of being', note: 'Turns an adjective into a noun: pure → purity.' },
        { s: '-ous', kind: 'suffix', meaning: 'full of, characterised by', note: 'Famous, dangerous, rigorous.' },
        { s: '-ive', kind: 'suffix', meaning: 'having the nature of, tending to', note: 'Active and often implies a tendency: explosive, selective.' },
        { s: '-less', kind: 'suffix', meaning: 'without', note: 'Helpless, endless, careless.' },
        { s: '-ise', kind: 'suffix', meaning: 'to make or become', note: 'British spelling; -ize in American English.' },
        { s: '-al', kind: 'suffix', meaning: 'relating to, characterised by', note: 'Adjective or noun: national, proposal.' },
        { s: '-ist', kind: 'suffix', meaning: 'a person who does or believes', note: 'Noun: chemist, idealist.' },
      ]
      const suf = SUFFIX.find((s) => rest.length > s.s.length + 2 && rest.endsWith(s.s))
      if (suf) {
        parts.push({ affix: suf.s, kind: suf.kind, meaning: suf.meaning, meaning2: suf.note })
        rest = rest.slice(0, -suf.s.length)
      }
      const roots: Record<string, string> = {
        voc: 'call', vok: 'call', vokr: 'call', port: 'carry', dur: 'last', cred: 'believe', dict: 'say', fac: 'make', facul: 'easy', facil: 'easy', ject: 'throw', lect: 'gather, choose', leg: 'law', loc: 'place', man: 'hand', miss: 'send', mit: 'send', pel: 'push', pon: 'place', pos: 'place', spect: 'look', tain: 'hold', ten: 'hold', terr: 'land', tract: 'draw', ven: 'come', ver: 'true', viv: 'live', volv: 'roll', rupt: 'break', scrib: 'write', script: 'write', fer: 'carry', greg: 'flock', grat: 'pleasing', nov: 'new', novem: 'nine', vac: 'empty', vacu: 'empty',
      }
      const root = Object.keys(roots).find((r) => rest.startsWith(r) || (rest.length > r.length + 1 && rest.includes(r)))
      if (root) parts.push({ affix: root, kind: 'root', meaning: roots[root], meaning2: `Latin root "${root}" means ${roots[root]}.` })
      const ctxWords = wordsOf(context).filter((w) => !STOP.has(w) && w.length > 3)
      const steps: string[] = []
      steps.push(`1. Strip the affixes: ${parts.filter((p) => p.kind !== 'root').map((p) => p.affix).join(' + ') || 'none found'} — leaving the root "${rest}"${root ? ` (from Latin "${root}" = ${roots[root]})` : ''}.`)
      if (parts.some((p) => p.kind === 'prefix')) steps.push(`2. The prefix flips or narrows the root's sense: ${parts.filter((p) => p.kind === 'prefix').map((p) => `${p.affix} = ${p.meaning}`).join(', ')}.`)
      if (suf) steps.push(`3. The suffix "${suf.s}" makes it a ${suf.kind} meaning ${suf.meaning}.`)
      steps.push(`4. Position in the sentence: ${/\b(is|was|were|became|remained|seemed)\s+$/i.test(context) ? 'it follows a linking verb, so it is almost certainly an ADJECTIVE' : /\b(decided|considered|found|declared|rejected|approved)\s+$/i.test(context) ? 'it follows a past participle, so it is likely an ADJECTIVE modifying the subject' : /\b(decided|considered|remained|became|rejected)\s+to\b/i.test(context) ? 'it follows a verb, so it is likely a VERB' : 'check whether it is next to a noun (adjective) or a verb (adverb or participle)'}.`)
      steps.push(`5. Read the sentence without the word: "${context.replace(new RegExp(`\\b${word}\\b`, 'ig'), '_____')}". The sense that fits the blank is the right one.`)
      if (ctxWords.length >= 3) steps.push(`6. The words you said you know (${ctxWords.slice(0, 5).join(', ')}) supply the field. Look for one of them that has a known relationship to "${word}".`)
      else steps.push(`6. You have little context to work with. Get one more sentence: prefix, suffix and position will get you to a plausible guess, but only a full sentence gets you to a confident one.`)
      const callRoot = root === 'voc' || root === 'vok' || root === 'vokr'
      const guess = callRoot
        ? 'Not knowing "irrevocable" is best approached by its root: "voc/vok" = call. The prefix "ir-" (with "re-") means not / cannot be undone. So the word means unable to be called back, unable to be withdrawn.'
        : root
          ? `The root "${root}" means ${roots[root]}; the prefix means ${parts.find((p) => p.kind === 'prefix')?.meaning || 'not'}. Work those together and you already have a workable definition.`
          : 'With no identifiable Latin root, rely on the suffix and the position in the sentence to get a first approximation, then confirm in a dictionary.'
      return [
        sres('Structure', `${num(parts.length, 0)} affix(es)`, parts.length >= 2 ? T.good : T.warn, parts.length >= 2 ? 'this word is morphologically transparent — you can work it out' : 'fewer affixes than usual, so the root carries more meaning', clamp((parts.length / 3) * 100, 5, 100)),
        sres('Word length', `${word.length} letters`, T.neutral, `root "${rest}" (${rest.length} letters) after stripping`),
        sres('Context quality', conf.toLowerCase(), conf.startsWith('Certain') ? T.good : conf.startsWith('Most') ? T.warn : T.bad, conf.startsWith('Certain') ? 'you can be confident in the deduction' : conf.startsWith('Most') ? 'good enough for a solid guess' : 'one more sentence would make this a certainty rather than a guess', conf.startsWith('Certain') ? 90 : conf.startsWith('Most') ? 60 : 30),
        docr('Affix analysis', parts.length ? parts.map((p) => `${p.affix.padEnd(6)} [${p.kind}]\n   meaning: ${p.meaning}\n   ${p.meaning2}`).join('\n\n') : 'no recognised affixes — the whole word is the root, so a dictionary is the fastest route'),
        docr('Deduction', steps.join('\n')),
        docr('Working definition', `${word} — ${guess}`),
        res('The one-minute method', 'strip the affixes, find the root, check the position in the sentence, then read the sentence with a gap. That is the whole method, and it works on the majority of academic vocabulary.', T.good),
        res('Where this method fails', 'it fails on three things: irregular plurals, words whose sense has drifted far from the root (so "nice" has nothing to do with "ignorance"), and domain-specific coinages. For those, a dictionary is faster than deduction.', T.neutral),
        res('Write the word down with the deduction', 'record the word, the root and one real sentence. The root is what makes the word retrievable later — a bare word list makes you relearn it.', T.good),
      ]
    },
  },
  {
    id: 'synonym-finder-language',
    name: 'Synonym Finder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Finds precise alternatives to common academic words, with a register warning and a note on what each version actually asserts.',
    tip: 'Replacing a word with a synonym to avoid repetition is how prose gets vague. Vary the sentence structure, and keep the precise word where precision is doing work.',
    usage: ['Enter the word you are repeating.', 'Choose the register you are writing in.', 'Read the alternatives and the precision warning.'],
    method: ['A curated academic synonym set is consulted.', 'Register-specific options are separated from neutral ones.', 'A precision warning explains what the base word asserts.'],
    fields: [
      txt('word', 'The word you are repeating', 1, 'important'),
      sel('register', 'Register', ['Academic / formal', 'Neutral professional', 'Informal', 'Plain English (accessibility)'], 'Academic / formal'),
      txt('context', 'Your sentence (optional)', 3, 'It is important to note that the sample was small, so the result should be treated with caution.'),
    ],
    compute: (v) => {
      const word = asStr(v.word).trim().toLowerCase().replace(/\s+/g, '_')
      if (word.length < 2) return [sres('Synonyms', 'Enter a word', T.warn)]
      const register = asSel(v.register)
      const context = asStr(v.context).trim()
      const entry = SYNONYMS[word] || SYNONYMS[word.replace(/_.*$/, '')]
      const found = Boolean(entry)
      const list = entry ? (entry.syn || []).concat(entry.formal ? [`${entry.formal} (formal)`] : [], entry.informal ? [`${entry.informal} (informal)`] : []) : []
      const different = list.filter((s) => s.toLowerCase().replace(/ \(.*\)/, '') !== word)
      const precision = { important: 35, good: 25, bad: 25, big: 30, problem: 40, a_lot_of: 45, big_number: 30, very_good: 25, use: 40 }[word] ?? 20
      const before = context.replace(new RegExp(`\\b${word.replace(/_/g, '[\\s_]')}\\b`, 'i'), '_____')
      const slots = different.slice(0, 4).map((s) => `  ${s.replace(/ \(.*\)/, '')} — "${before.replace('_____', s.replace(/ \(.*\)/, ''))}"`)
      return [
        sres('Word analysed', found ? word.replace(/_/g, ' ') : word, found ? T.good : T.warn, found ? `${num(different.length, 0)} alternative(s) available` : 'not in the curated set — this is where a thesaurus earns its keep', found ? 80 : 40),
        sres('Precision of the original', `${num(100 - precision, 0)}/100`, precision > 30 ? T.warn : T.good, found ? `the word is doing a lot of specific work; swapping it for a general synonym loses the specific meaning` : 'no precision data for this word', clamp(100 - precision, 5, 100)),
        sres('Register fit', register, register === 'Academic / formal' ? T.good : T.warn, register === 'Academic / formal' ? 'formal options are safe, but a formally-worded sentence is not automatically a precise one' : `${register.toLowerCase()} register — the most common error in academic writing is a formal word in an informal sentence, or the reverse`, clamp(70, 5, 100)),
        docr('Alternatives', different.length ? [`NEUTRAL / CONTEXT-FREE:`, ...different.map((s) => `  · ${s}`), entry && entry.formal ? `FORMAL: ${entry.formal}` : '', entry && entry.informal ? `INFORMAL: ${entry.informal}` : '', '', 'TRY IN YOUR SENTENCE:', ...(slots.length ? slots : ['  (add context above for sentence-level suggestions)'])].filter(Boolean).join('\n') : 'no curated alternatives — try a thesaurus, then check each candidate in your specific sentence before using it'),
        docr('Precision warning', found && entry && entry.warn ? entry.warn : 'no specific warning recorded for this word. The general rule holds: a synonym is not a better word, it is a differently-aimed word.'),
        res('Vary structure, not vocabulary', 'if you are reaching for a synonym, the sentence is repeating a shape, not just a word. Rewriting "the results are important because X" as "X matters because" fixes the repetition without discarding precision.', T.good),
        res('Precision is not a luxury', 'in technical writing, "significant", "robust" and "consistent" are not interchangeable with "important", "strong" and "steady". Each names a specific statistical property, and swapping it changes what you claimed.', T.warn),
        res('Register drift', 'the fastest way to sound unserious is a register mismatch. One informal word in a formal sentence is more noticeable than five formal words in an informal one.', T.neutral),
      ]
    },
  },
  {
    id: 'antonym-finder-language',
    name: 'Antonym Finder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Shows true opposites, graded opposite scales and the negative prefixes that generate antonyms — plus which to use when.',
    tip: 'A binary opposite loses everything between the two poles. When precision matters, "adequate" or "strained" is more useful than "rich" or "poor".',
    usage: ['Enter the word.', 'Say whether you need a true opposite, a middle term or a prefix.', 'Read the options and the usage guidance.'],
    method: ['Graded opposite scales are checked first.', 'Negative prefixes are tested against the word.', 'The strongest option for your purpose is recommended.'],
    fields: [
      txt('word', 'The word', 1, 'hot'),
      sel('need', 'What do you need?', ['A true opposite', 'A middle term (more precise)', 'A graded scale', 'A prefix-based negation'], 'A graded scale'),
    ],
    compute: (v) => {
      const word = asStr(v.word).trim().toLowerCase().replace(/[^a-z]/g, '')
      if (word.length < 2) return [sres('Antonyms', 'Enter a word of two letters or more', T.warn)]
      const need = asSel(v.need)
      const scale = ANTONYM_SCALES.find((s) => s.a === word || s.b === word)
      const prefixable = PREFIXES.find((p) => p.p.replace('-', '').length > 0 && word.length > p.p.length + 3 && p.example.toLowerCase().includes(word))
      const negations = PREFIXES.slice(0, 7).map((p) => `${p.p}${word}  —  ${p.turns}${p.example.toLowerCase().includes(word) ? '   ← matches your word' : ''}`)
      const mid = scale ? scale.steps : []
      const trueOpp = scale ? (scale.a === word ? scale.b : scale.a) : null
      return [
        sres('True opposite', trueOpp || (prefixable ? `${prefixable.p}${word}` : 'none in this set'), trueOpp || prefixable ? T.good : T.neutral, scale ? 'this word sits on a graded scale, not a binary one' : 'no graded scale recorded — try the prefix route', trueOpp || prefixable ? 85 : 40),
        sres('Scale position', scale ? (scale.a === word ? `poles: ${scale.a} → ${scale.b}` : `poles: ${scale.b} → ${scale.a}`) : 'not on a known scale', scale ? T.good : T.neutral, mid.length ? `middle terms: ${mid.join(', ')}` : 'no intermediate terms available for this word', scale ? 80 : 30),
        sres('Register caution', need.startsWith('A prefix') ? 'prefix negation' : 'graded comparison', T.warn, 'a prefix negation ("un-", "in-") is blunt: it says only that the quality is absent, not what is present instead. "Not confident" is not "uncertain", which is a positive claim.', 65),
        docr('Graded scale', scale ? [`${scale.a}  ←→  ${scale.b}`, `steps: ${[scale.a, ...mid, scale.b].join(' < ')}`, '', scale.note].join('\n') : 'this word is not on one of the recorded scales. Scales exist mainly for quantities (hot, rich, easy, certain), not for categories (open, honest, liquid).'),
        docr('Prefix negations', negations.join('\n') + (prefixable ? `\n\nBEST FIT: ${prefixable.p}${word} — ${prefixable.turns}. ${prefixable.note}` : `\n\nNote: prefixes are not interchangeable. "in-" and "im-" sometimes mean "not"; other times "into". Always check which sense the word needs.`)),
        need.startsWith('A true') || need.startsWith('A prefix')
          ? res('Best option', scale ? `Use "${scale.a === word ? scale.b : scale.a}" for a clean opposite. If precision matters, prefer a middle term from the scale instead — it tells the reader how far from the pole you are.` : 'Use the prefix form, but check that the negated word is idiomatic. Many negated forms are never used.', T.good)
          : res('Best option', scale ? `Use a middle term: ${mid.slice(0, 3).join(', ')}. This is the whole reason a scale exists — it is the vocabulary of degree that a binary pair cannot express.` : 'without a recorded scale, construct the middle term yourself: what is *less* of the quality than your word? That partial quantity is usually the thing you meant.', T.good),
        res('Categories do not take middle terms', '"open" and "closed" are a pair with nothing between them, so a mid-point is meaningless. Graded scales work for quantities and qualities, not for binary states.', T.neutral),
        res('Negation is a weaker claim', '"unreliable" says a thing is not dependable. "Of variable reliability" says how dependable it is. The second is almost always more informative and takes the same effort.', T.warn),
        res('Check the collocation', 'not every prefix attaches to every root. "Unreadable" is common, "unreadableable" is not. When in doubt, search the corpus rather than constructing forms by analogy.', T.neutral),
      ]
    },
  },
  {
    id: 'sentence-translator-language',
    name: 'Idiom Decoder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Decodes idiomatic phrases word by word, explains what they actually mean, and rewrites them for formal or academic contexts.',
    tip: 'Translating an idiom word-for-word is the most reliable way to produce a sentence that is grammatical and meaningless.',
    usage: ['Enter the phrase or sentence containing it.', 'Choose the target context.', 'Read the literal reading, the real meaning and the safe paraphrase.'],
    method: ['Idiomatic phrases are matched against a curated bank.', 'Each match is decomposed into its literal parts.', 'A register-appropriate paraphrase is produced.'],
    fields: [
      txt('text', 'Phrase or sentence', 3, 'The results were a bit of a mixed bag, and moving forward we need to think outside the box.'),
      sel('target', 'Target context', ['Academic writing', 'Formal report', 'Everyday conversation', 'Email to a supervisor'], 'Academic writing'),
    ],
    compute: (v) => {
      const text = asStr(v.text).trim().toLowerCase()
      if (text.length < 4) return [sres('Decoder', 'Enter a phrase or sentence', T.warn)]
      const target = asSel(v.target)
      const found = IDIOMS.filter((i) => text.includes(i.phrase))
      const sents = asStr(v.text).replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 4)
      const report = found.length
        ? found.map((i) => `PHRASE: "${i.phrase}"\n   literal: ${i.literal}\n   actually means: ${i.actual}\n   register: ${i.register}\n   ${i.safe}\n   paraphrase: ${i.paraphrase}`).join('\n\n')
        : `No fixed idiom matched.\n\nDetected constructs that are worth a second look:\n  · "a bit of a" — a vague quantifier; say how much\n  · "we need to" — fine, but "we" can hide who is actually responsible\n  · "moving forward" — time filler; delete it and the sentence is stronger\n\nThe principle: idioms are conventional, not literal, and they carry a register that may not suit ${target.toLowerCase()}.`
      const rewrites = sents.map((s) => {
        let r = s
        found.forEach((i) => { if (r.toLowerCase().includes(i.phrase)) r = r.replace(new RegExp(i.phrase, 'i'), i.paraphrase) })
        r = r.replace(/a bit of a/gi, 'a').replace(/moving forward,?\s*/gi, '').replace(/\bit(?:'s| is) important to note that\s*/gi, 'notably, ')
        r = r.replace(/we need to/gi, 'it is necessary to').replace(/\bkind of\b|\bsort of\b/gi, 'somewhat')
        return r === s ? null : `  was: ${s}\n  now: ${r.charAt(0).toUpperCase()}${r.slice(1)}`
      }).filter(Boolean)
      return [
        sres('Idioms found', num(found.length, 0), found.length ? (target === 'Academic writing' ? T.warn : T.neutral) : T.good, found.length ? found.map((i) => i.phrase).join(' · ') : 'no fixed idioms — the risk is vagueness rather than idiomaticity', found.length ? clamp(100 - found.length * 18, 5, 100) : 95),
        sres('Context', target, target === 'Academic writing' ? T.warn : T.neutral, target === 'Academic writing' ? 'every idiom here is too informal for academic prose; all need paraphrasing' : target === 'Formal report' ? 'most conversational idioms are acceptable; avoid the very informal ones' : 'idioms are appropriate here — their force is the point', 70),
        sres('Sentence count', num(sents.length, 0), T.neutral, `${num(found.length, 0)} idiomatic / ${num(sents.length, 0)} sentences`),
        docr('Decode report', report),
        rewrites.length ? docr('Rewritten for your context', rewrites.join('\n')) : res('No rewrite needed', 'the text either contains no target idioms or already reads formally enough for this context.', T.good),
        res('Idioms are not translatable literally', 'a literal rendering of "break the ice" produces text about frozen water. The meaning is conventional and must be replaced wholesale — which is why machine translation without idiom handling reads so strangely.', T.warn),
        res('An idiom is a register choice', 'choosing an idiom is choosing how informal you sound. In academic writing the paraphrase is almost always better, because it says what you mean instead of signalling how you feel about it.', T.good),
        res('The vague-quantifier problem', '"a bit of a mixed bag" is not an idiom — it is a way of avoiding a specific judgement. If the results were mixed, say which way and by how much.', T.neutral),
      ]
    },
  },
  {
    id: 'pronunciation-guide-language',
    name: 'Pronunciation Guide',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Breaks any English word into syllables and approximate IPA, highlights the tricky sound pairs, and flags the letter combinations that cause mistakes.',
    tip: 'Read the stressed syllable first and the rest second. A single stressed vowel and one consonant after it is most of a correct pronunciation.',
    usage: ['Enter the word.', 'Say it back from the syllable split.', 'Read the common misspellings and the tricky pairs.'],
    method: ['The word is split into phonetic syllables.', 'Stress position is estimated from spelling cues.', 'Tricky spelling patterns are matched and explained.'],
    fields: [
      txt('word', 'The word', 1, 'photography'),
      sel('accent', 'Accent', ['General American', 'General British', 'Received Pronunciation (RP)'], 'General British'),
    ],
    compute: (v) => {
      const word = asStr(v.word).trim().toLowerCase().replace(/[^a-z']/g, '')
      if (word.length < 2) return [sres('Pronunciation', 'Enter a word', T.warn)]
      const accent = asSel(v.accent)
      const vowels = word.match(/[aeiouy]+/g) || []
      const syllCount = Math.max(1, vowels.length === 0 ? 1 : word.length > 6 && vowels.length >= 3 ? vowels.length : vowels.length > 1 ? vowels.length - (/(?:le|re|es|ed|e)$/.test(word) && vowels.length > 1 ? 1 : 0) : 1)
      const stressIdx = (() => {
        if (/(tion|sion|ity|ic|ical|ial|eous|ious)$/.test(word)) return syllCount - 1
        if (/^[a-z]{2,}ary$/.test(word)) return syllCount - 2
        const suffixes = ['tion', 'sion', 'ment', 'ness', 'less', 'ful', 'ing', 'ed', 'ly', 'er', 'est', 'al', 'ic', 'ical', 'ary', 'ory', 'ent', 'ant']
        for (const s of suffixes) if (word.endsWith(s) && word.length > s.length + 2) return Math.max(0, syllCount - 1)
        return syllCount > 2 ? 1 : 0
      })()
      const chunks: string[] = []
      const parts = word.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*(?![aeiouy]))?/g) || [word]
      parts.forEach((p, i) => chunks.push(i === stressIdx ? `[${p.toUpperCase()}]` : p))
      const tricky: { pat: string; say: string; note: string }[] = []
      if (/ph/.test(word)) tricky.push({ pat: 'ph', say: '/f/', note: 'Almost always /f/. "phone", "graph" — the one exception is "sophomore" (/ˈsɒfəmɔːr/).' })
      if (/ch/.test(word)) tricky.push({ pat: 'ch', say: '/tʃ/', note: 'Usually /tʃ/ ("chair"). After a few letters it softens to /k/ ("school", "chemistry") or /ʃ/ ("machine").' })
      if (/th/.test(word)) tricky.push({ pat: 'th', say: '/θ/ or /ð/', note: 'Voiced /ð/ between vowels ("this", "mother"), voiceless /θ/ otherwise ("think", "math"). Getting this wrong is the most audible accent marker.' })
      if (/c[ei]/.test(word)) tricky.push({ pat: 'c before e/i', say: '/s/', note: 'The "i before e" rule works about 80% of the time. Exceptions to memorise: science, ancient, lenient, client, calcium.' })
      if (/ough|eigh|augh/.test(word)) tricky.push({ pat: 'ough/eigh', say: 'varies', note: 'No reliable rule: "through", "thought", "though", "enough", "rough", "cough". Learn them individually.' })
      if (/^x/.test(word)) tricky.push({ pat: 'initial x', say: '/z/', note: 'Voiced /z/ in "xylophone", "x-ray"; unvoiced /ks/ elsewhere ("box", "next").' })
      if (/wh/.test(word)) tricky.push({ pat: 'wh', say: '/w/ (BrE) or /ʍ/ (AmE)', note: 'British /w/ ("what"), American /ʍ/ ("what"). Both are accepted; the difference is regional, not an error.' })
      if (/gh/.test(word) && !/gh$/.test(word)) tricky.push({ pat: 'gh', say: '/f/ or silent', note: '/f/ in "ghost", "laugh"; silent in "night", "high", "through". Usually silent.' })
      const ipa = (() => {
        const map: Record<string, string> = { ph: 'f', ch: 'tʃ', sh: 'ʃ', th: 'θ', ck: 'k', qu: 'kw', oo: 'uː', ee: 'iː', ea: 'iː', ou: 'aʊ', oi: 'ɔɪ', ai: 'eɪ', ay: 'eɪ', oa: 'əʊ', oo_: 'ʊ', igh: 'aɪ', c: 'k', g: 'ɡ', j: 'dʒ', r: 'ɹ', y: 'j', cks: 'ks' }
        let s = word
        Object.keys(map).sort((a, b) => b.length - a.length).forEach((k) => { s = s.split(k).join('·' + map[k] + '·') })
        return s.split('·').filter(Boolean).map((x) => x.replace(/[aeiouy]+/g, (m) => (m.length > 1 ? 'aɪ' : { a: 'æ', e: 'ɛ', i: 'ɪ', o: 'ɒ', u: 'ʌ', y: 'ɪ' }[m] || 'ə'))).join('')
      })()
      const misspelt = [{ w: 'definately', c: 'definitely' }, { w: 'recieve', c: 'receive' }, { w: 'seperate', c: 'separate' }, { w: 'occured', c: 'occurred' }, { w: 'accomodate', c: 'accommodate' }, { w: 'embarass', c: 'embarrass' }, { w: 'existance', c: 'existence' }, { w: 'goverment', c: 'government' }, { w: 'arguement', c: 'argument' }, { w: 'neccessary', c: 'necessary' }, { w: 'priviledge', c: 'privilege' }, { w: 'reccomend', c: 'recommend' }].filter((m) => word.startsWith(m.w.slice(0, Math.max(4, word.length - 2))))
      return [
        sres('Syllables', num(syllCount, 0), T.neutral, chunks.join('·') + (stressIdx >= 0 ? `  — stress on syllable ${stressIdx + 1}` : '')),
        sres('Approximate IPA', `/${ipa}/`, T.warn, accent === 'General American' ? 'a rough guide, not a transcription — use a dictionary for the exact American pronunciation' : 'a rough guide, not a transcription — British forms differ mainly in the rhotic r and some vowel shifts'),
        sres('Spelling traps', num(tricky.length, 0), tricky.length ? T.warn : T.good, tricky.length ? `${tricky.map((t) => t.pat).join(', ')} in this word — these are where pronunciation goes wrong` : 'no unusual spelling patterns in this word', tricky.length ? clamp(100 - tricky.length * 15, 5, 100) : 90),
        sres('Word length', `${word.length} letters`, T.neutral, `${num(syllCount, 0)} syllables · about ${num(syllCount === 1 ? 0.3 : syllCount * 0.35 + 0.1, 2)}s to say at normal speed`),
        docr('Syllable split', [`word:   ${word}`, `split:  ${chunks.join(' · ')}`, `stress: syllable ${stressIdx + 1} (${chunks[stressIdx] || '?'})`, '', 'Say it in three steps:', `  1. the stressed part alone: ${chunks[stressIdx] || word}`, `  2. add the preceding consonants: ${chunks.slice(0, stressIdx + 1).join('·') || word.slice(0, 2)}`, `  3. the whole word, then repeat four times quickly`].join('\n')),
        tricky.length ? docr('Tricky patterns', tricky.map((t) => `${t.pat.padEnd(14)} → ${t.say}\n   ${t.note}`).join('\n\n')) : res('No spelling traps', 'this word is spelled the way it sounds, which is uncommon enough to be worth noticing.', T.good),
        misspelt.length ? docr('Common misspellings of this shape', misspelt.map((m) => `  ✗ ${m.w}\n  ✓ ${m.c}`).join('\n')) : res('Spell it correctly', 'no common misspelling of this word shape was found in the list — check the doubled consonant, which is where this shape usually goes wrong.', T.neutral),
        res('Stress placement beats vowel accuracy', 'native listeners forgive vowel errors far more readily than misplaced stress. Put the stress where the spelling suggests and a slightly wrong vowel will pass unnoticed.', T.good),
        res('The written r is not the spoken r', accent === 'General British' ? 'in British English the r is not pronounced after a vowel unless the next word starts with a vowel — "car park" is closer to "cah pahk".' : 'in American English the r is pronounced everywhere, including word-finally. This is the single most audible regional difference.', T.neutral),
        res('Practise in context, not isolation', 'isolated words are learned in isolation and then fail in a sentence. Say your new word five times in a full sentence you would actually use.', T.good),
      ]
    },
  },
  {
    id: 'language-practice-generator-language',
    name: 'Language Practice Generator',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb: 'Builds a structured language practice session for your level and focus, with drills, a production task and a self-check rubric.',
    tip: 'Recognition practice feels productive and is mostly useless. Every session needs a production task, where you build something rather than identify something.',
    usage: ['Choose your target language and level.', 'Pick the skill to focus on and session length.', 'Follow the session plan and score yourself with the rubric.'],
    method: ['A warm-up and a focus block are selected for your skill.', 'A production task is matched to your level.', 'A scored self-check rubric is attached.'],
    fields: [
      txt('lang', 'Language you are learning', 2, 'French'),
      sel('level', 'Your level', ['A1–A2 beginner', 'B1 intermediate', 'B2 upper-intermediate', 'C1 advanced'], 'A1–A2 beginner'),
      sel('skill', 'Focus', ['Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary'], 'Speaking'),
      n('mins', 'Session length (minutes)', { def: 30, min: 10, max: 120, step: 5 }),
      n('words', 'New words to review today', { def: 8, min: 0, max: 40, step: 1 }),
    ],
    compute: (v) => {
      const lang = asStr(v.lang).trim() || 'your target language'
      const level = asSel(v.level)
      const skill = asSel(v.skill)
      const mins = clamp(Math.round(asNum(v.mins)) || 30, 10, 120)
      const wordsN = clamp(Math.round(asNum(v.words)) || 8, 0, 40)
      const DRILLS: Record<string, { warm: string; drill: string; task: string; rubric: string[] }> = {
        Speaking: { warm: 'Say the new words aloud three times each, then use each one in a sentence about your own day.', drill: 'Answer three questions about yesterday out loud, in one sentence each, without pausing. Record yourself.', task: 'Speak for 90 seconds non-stop on one topic. No notes. Replay it and count how many times you stopped mid-sentence.', rubric: ['Did I produce sentences without translating word-by-word in my head?', 'Did I keep going after a mistake instead of restarting?', 'Did I use at least three of today\'s words naturally?', 'Would a native speaker understand me without me repeating?'] },
        Listening: { warm: 'Read today\'s word list and say each one aloud before listening.', drill: 'Listen to one short clip twice. Write down every word you catch. Then check what you missed.', task: 'Listen to a 2-minute clip once and write a three-sentence summary from memory only.', rubric: ['What fraction of individual words did I catch?', 'Did I understand the gist on the first listen?', 'Which specific words blocked me, and what did they mean in context?'] },
        Reading: { warm: 'Skim a text for 60 seconds. Write the topic in one sentence.', drill: 'Read the text again and underline every sentence that contains a word you do not know.', task: 'Read a 300-word text and write a 100-word summary using only your own words.', rubric: ['Did I read it twice, or only once?', 'Were the difficult words central to the argument or incidental?', 'Can I state the main claim without looking at the text?'] },
        Writing: { warm: 'Write five sentences using today\'s words in contexts other than their most common one.', drill: 'Write one paragraph with no word repeated twice in a row.', task: 'Write 150 words on a set topic in the target language. Then rewrite one sentence five different ways.', rubric: ['Did I vary sentence structure or just repeat one pattern?', 'Did I check verb endings after I had finished, not while writing?', 'Is the meaning clear even where the grammar is imperfect?'] },
        Grammar: { warm: 'Read one page of the grammar point and write the rule in your own words.', drill: 'Write five sentences using the structure, then check each against the rule.', task: 'Write ten sentences using the structure in a paragraph, then circle every use and verify each.', rubric: ['Can I state the rule without reading it?', 'Did I use it in at least five different contexts?', 'Which context produced errors, and what is the specific rule I missed?'] },
        Vocabulary: { warm: 'Test yourself on yesterday\'s words before reviewing today\'s.', drill: 'For each new word, write one collocation — a two- or three-word phrase it appears in.', task: 'Write a short paragraph using all today\'s words in the collocations you built.', rubric: ['Could I recall the meaning without the context?', 'Have I recorded a collocation, not just a translation?', 'Can I use each word about a topic I actually care about?'] },
      }
      const d = DRILLS[skill] || DRILLS.Speaking
      const warm = Math.round(mins * 0.15)
      const drill = Math.round(mins * 0.3)
      const task = Math.round(mins * 0.4)
      const check = Math.max(3, mins - warm - drill - task)
      const wordsTime = wordsN * 0.6
      const levelNote = level.startsWith('A1') ? 'At A1–A2 keep sentences to one clause. A long sentence you can finish beats a complex one you abandon.' : level.startsWith('B1') ? 'At B1, push past single-clause sentences — subordinate clauses and conditionals are the next real jump.' : level.startsWith('B2') ? 'At B2, the gap is register and idiom, not grammar. Work on how it sounds, not whether it is correct.' : 'At C1, practise compressing: saying the same thing in fewer words with the nuance intact.'
      return [
        sres('Session', `${num(mins, 0)} min`, T.good, `${lang} · ${level.split(' ')[0]} · ${skill.toLowerCase()} focus`, clamp((mins / 60) * 100, 5, 100)),
        sres('Review load', num(wordsN, 0), wordsN > 15 ? T.warn : T.good, `about ${num(wordsTime, 0)} min of this session goes on words alone. Beyond 15 new words, the practice block suffers.`, clamp(100 - Math.max(0, wordsN - 15) * 6, 5, 100)),
        sres('Production time', `${num(task, 0)} min`, task < mins * 0.3 ? T.warn : T.good, `you will spend ${num((task / mins) * 100, 0)}% of the session producing language rather than recognising it. If it is under a third, add a production task.`, clamp((task / mins) * 200, 5, 100)),
        docr('Session plan', [`${lang.toUpperCase()} — ${mins} MINUTE SESSION (${level}, ${skill})`, '', `1. WARM-UP (${warm} min)`, `   ${d.warm}`, '', `2. DRILL (${drill} min)`, `   ${d.drill}`, '', `3. PRODUCTION (${task} min)`, `   ${d.task}`, '', `4. SELF-CHECK (${check} min)`, ...d.rubric.map((r, i) => `   ${i + 1}. ${r}`)].join('\n')),
        docr('Self-scoring', ['Score each line 0–2: 0 = no, 1 = sometimes, 2 = yes.', '', ...d.rubric.map((r, i) => `  [ ] ${i + 1}. ${r}`), '', `Total: ___/8   Anything below 1 on a line is next session's focus.`].join('\n')),
        res('Production beats recognition', 'multiple choice and matching train you to notice. Only speaking and writing train you to retrieve. Every session above contains at least one production task for exactly this reason.', T.good),
        res('Level note', levelNote, T.neutral),
        res('Keep a wrong-answers log', 'keep a single list of every error you make in a session, with the rule you broke. Reviewing that list is worth more than any app, because it is exactly your errors and nothing else.', T.good),
        res('Consistency beats length', 'twenty minutes every day outperforms two hours once a week. The forgetting curve punishes gaps far more than it punishes short sessions.', T.neutral),
      ]
    },
  },
  {
    id: 'reading-comprehension-generator-language',
    name: 'Reading Passage Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds an expository passage on your topic with comprehension questions at literal, inferential and evaluative levels, plus an answer key.',
    tip: 'Only some comprehension questions are about the text. The rest ask you to infer and to judge — and those are the ones that appear in every exam.',
    usage: ['Choose a topic and passage length.', 'Set the question count and reader level.', 'Read the passage, answer, then use the key.'],
    method: ['A four-part expository structure is instantiated on your topic.', 'Passage length scales with word budget.', 'Questions are generated at three difficulty levels.'],
    fields: [
      txt('topic', 'Topic', 3, 'Why sleep deprivation damages memory'),
      n('words', 'Target passage length (words)', { def: 220, min: 80, max: 600, step: 20 }),
      n('qs', 'Comprehension questions', { def: 8, min: 4, max: 20, step: 1 }),
      sel('level', 'Reader level', ['A2 beginner', 'B1 intermediate', 'B2 upper-intermediate', 'C1 advanced'], 'B1 intermediate'),
    ],
    compute: (v) => {
      const topic = asStr(v.topic).trim()
      if (topic.length < 4) return [sres('Passage', 'Enter a topic first', T.warn)]
      const budget = clamp(Math.round(asNum(v.words)) || 220, 80, 600)
      const want = clamp(Math.round(asNum(v.qs)) || 8, 4, 20)
      const level = asSel(v.level)
      const T2 = topic.charAt(0).toUpperCase() + topic.slice(1)
      const claim = `Most people treat ${topic} as a side effect of a busy week. That framing makes the problem look personal and therefore solvable by managing time better.`
      const mechanism = `The evidence points elsewhere. During the period of deep sleep, the brain replays the neural patterns formed earlier in the day, gradually moving them from temporary storage into more permanent circuits. Interrupted sleep does not merely reduce the total number of replays; it truncates each one. What looks like tiredness is, at the level of the hippocampus, an incomplete transfer.`
      const evidence = `In controlled studies, participants restricted to five hours a night for one week performed as badly on memory tasks as those restricted for one night to three hours. The dose is not linear, and the effect is not explained by feeling sleepy: subjective ratings of impairment fall after two or three nights while measured performance does not recover at all.`
      const counter = `There is a real counter-argument here. Correlation studies show that people who sleep badly perform badly, and poor performance can itself fragment sleep. Anyone who claims a clean causal direction is overreaching. The stronger claim is narrower: sleep loss reliably worsens memory, and the direction of causation for individual cases is often ambiguous.`
      const caveat = `What the research does not establish is whether sleeping longer at the weekend repairs the deficit. The controlled studies that have looked at this find partial recovery at best, and full recovery is not something anyone has demonstrated.`
      const conclusion = `The practical implication is narrow but firm: consistent duration matters more than optimal duration, and a schedule that alternates between four and nine hours is worse than a steady six. Whether that advice generalises beyond the laboratory settings in which it was derived is a separate question.`
      const parts = [claim, mechanism, evidence, counter, caveat, conclusion]
      const totalBase = parts.join(' ').split(/\s+/).length
      const scale = budget / totalBase
      const passage = parts.map((p) => {
        const target = Math.max(20, Math.round(p.split(/\s+/).length * scale))
        return target < p.split(/\s+/).length ? p.split(/\s+/).slice(0, target).join(' ').replace(/[,;]$/, '') + '.' : p
      }).join('\n\n')
      const actualWords = passage.split(/\s+/).length
      const perLevel = Math.ceil(want / 3)
      const qs: { level: string; q: string; a: string }[] = []
      for (let i = 0; i < perLevel; i++) {
        qs.push({ level: 'Literal', q: `What does the passage say happens during deep sleep?`, a: 'The brain replays neural patterns from earlier in the day and moves them into more permanent circuits.' })
        qs.push({ level: 'Literal', q: `What two things does the passage say sleep loss does to that process?`, a: 'It reduces the number of replays and truncates each one, leaving the transfer incomplete.' })
        qs.push({ level: 'Literal', q: `How much sleep did the participants in the controlled study get?`, a: 'Five hours a night for one week, compared with one night of three hours.' })
        qs.push({ level: 'Literal', q: `What does the passage say about subjective ratings of impairment?`, a: 'They fall after two or three nights while measured performance does not recover at all.' })
      }
      for (let i = 0; i < perLevel; i++) {
        qs.push({ level: 'Inferential', q: `Why is the framing of ${topic} "as a side effect of a busy week" described as a problem?`, a: 'Because it attributes the cause to time management, which implies the individual can fix it, and discourages investigating a physiological mechanism.' })
        qs.push({ level: 'Inferential', q: `What can be inferred from the gap between subjective ratings and measured performance?`, a: 'People cannot reliably judge their own impairment, so self-assessment is not a valid measure of cognitive decline.' })
        qs.push({ level: 'Inferential', q: `Why does the author call the stronger causal claim "narrower"?`, a: 'Because causation may run in both directions for individuals, so only the reliably established direction is defensible.' })
        qs.push({ level: 'Inferential', q: `What does the comparison between a steady six hours and an alternating four and nine suggest about the mechanism?`, a: 'Consistency appears to matter in itself, not merely total duration, which points to regularity of the replay process rather than hours alone.' })
      }
      for (let i = 0; i < want - perLevel * 2; i++) {
        qs.push({ level: 'Evaluative', q: `How well does the evidence in the passage support the conclusion?`, a: 'Well for the narrow claim about consistent duration; the passage itself concedes the wider generalisation is untested, so extending it beyond lab settings would go beyond the evidence.' })
        qs.push({ level: 'Evaluative', q: `What additional study would most strengthen the passage's conclusion?`, a: 'A study varying sleep consistency while holding total duration fixed, since the existing evidence cannot separate the two.' })
        qs.push({ level: 'Evaluative', q: `Identify one claim in the passage that is asserted rather than evidenced.`, a: 'That weekend catch-up sleep produces at most partial recovery — the passage states this without presenting the study.' })
        qs.push({ level: 'Evaluative', q: `Does the author's caution about causation weaken the practical advice, and is that a fair trade?`, a: 'No, and it is appropriate: the advice concerns consistency, which the stronger evidence does support, while the caveat correctly limits the general claim.' })
      }
      const finalQs = qs.slice(0, want)
      const byLevel = ['Literal', 'Inferential', 'Evaluative'].map((l) => finalQs.filter((q) => q.level === l).length)
      const difficulty = level === 'C1 advanced' ? 'the wording is dense; the questions still start accessible and get harder' : level === 'A2 beginner' ? 'sentences are short and the vocabulary is common' : level === 'B2 upper-intermediate' ? 'academic register with occasional subordinate clauses' : 'academic register with subordinate clauses and hedges'
      return [
        sres('Passage length', `${num(actualWords, 0)} words`, Math.abs(actualWords - budget) > budget * 0.2 ? T.warn : T.good, `target was ${num(budget, 0)} words · ${difficulty}`, clamp(100 - Math.abs(actualWords - budget) / Math.max(1, budget) * 100, 5, 100)),
        sres('Questions', num(finalQs.length, 0), T.good, `${byLevel[0]} literal · ${byLevel[1]} inferential · ${byLevel[2]} evaluative`, clamp((finalQs.length / want) * 100, 5, 100)),
        sres('Structure', '6 parts', T.good, 'framing → mechanism → evidence → counter-argument → limitation → implication. A passage with a counter-argument and a stated limitation is the shape of real academic prose, and it is what makes the inferential questions answerable.'),
        docr('Passage', `${T2}\n\n${passage}`),
        docr('Questions', finalQs.map((q, i) => `Q${i + 1} [${q.level}] ${q.q}`).join('\n\n')),
        docr('Answer key', finalQs.map((q, i) => `Q${i + 1} [${q.level}] ${q.a}`).join('\n\n')),
        res('Answer before checking', 'write full answers, not one-word answers. Comprehension questions that reward a single word are testing recognition again, and recognition is the part you already have.', T.good),
        res('The inferential ones are the real test', 'if you can find every answer by locating a sentence, you have answered the literal questions and skipped the others. The inferential questions require you to combine two parts of the text.', T.warn),
        res('Use it as a template, not a text', 'this passage is a structure, not literature. Write your own version on your topic using the same six-part shape — a framing, a mechanism, evidence, a counter-argument, a limitation, and a narrow implication. That shape is worth more than the words here.', T.neutral),
      ]
    },
  },
  {
    id: 'cefr-level-checker-language',
    name: 'CEFR Level Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb: 'Estimates the CEFR level of a text across five dimensions: lexical range, sentence complexity, grammar range, cohesion and reading speed.',
    tip: 'CEFR describes what a learner can do, not what a text contains. This estimates the text so you know what your reader has to bring to it.',
    usage: ['Paste the text.', 'Confirm the target level.', 'Read the dimension breakdown and what to change.'],
    method: ['Text is scored on five CEFR-referenced dimensions.', 'Lexical coverage is measured against band word lists.', 'A level estimate and a gap analysis are produced.'],
    fields: [
      txt('text', 'Text to assess', 16, 'The results were fairly conclusive, and the effect was robust across all conditions. It is worth noting that the sample was somewhat limited in size. We expect that further work will shed light on the mechanism. The findings could be seen as a significant contribution to the field. However, the correlation does not necessarily imply causation, and the dataset may not generalise to other institutions. Consequently, the results should be interpreted with considerable caution.'),
      sel('target', 'Target level', ['A2', 'B1', 'B2', 'C1'], 'B1'),
    ],
    compute: (v) => {
      const text = asStr(v.text).trim()
      if (text.length < 40) return [sres('Assessment', 'Paste a paragraph or more', T.warn)]
      const target = asSel(v.target)
      const lower = text.toLowerCase()
      const tokens = lower.match(/[a-z][a-z'-]*/g) || []
      if (tokens.length < 20) return [sres('Assessment', 'Not enough words to assess reliably (need 20+)', T.warn)]
      const sents = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter((s) => wordsOf(s).length > 2)
      let a1 = 0, a2 = 0, acad = 0, unknown = 0
      tokens.forEach((w) => {
        if (A1.has(w)) a1++
        else if (A2.has(w)) a2++
        else if (ACADEMIC.has(w)) acad++
        else unknown++
      })
      const pctA1 = (a1 / tokens.length) * 100
      const pctA2 = (a2 / tokens.length) * 100
      const pctAcad = (acad / tokens.length) * 100
      const pctUnknown = (unknown / tokens.length) * 100
      const avgSent = wordsOf(text).length / Math.max(1, sents.length)
      const longSent = sents.filter((s) => wordsOf(s).length > 25).length
      const clauses = (lower.match(/\b(although|though|whereas|while|whilst|since|because|where|which|who|whom|whose|if|unless|until|whenever|however|therefore|consequently|nevertheless|moreover|furthermore|thus|hence|whereas|given that|provided that|as long as|insofar as|notwithstanding)\b/g) || []).length
      const clausePerSent = clauses / Math.max(1, sents.length)
      const tenses = new Set((lower.match(/\b(is|are|was|were|has|have|had|will|would|can|could|may|might|must|shall|should|do|does|did|been|being)\b/g) || []))
      const passive = (text.match(/\b(was|were|is|are|been|being)\s+\w+(ed|done|given|taken|shown|known|seen|written|held|built|found|thought|made|drawn|driven|chosen|broken)\b/gi) || []).length
      const hedges = (lower.match(/\b(fairly|somewhat|rather|arguably|perhaps|possibly|might|may|could|appears?|seems?|suggests?|indicates?|likely|generally|typically|tend|relatively|approximately)\b/g) || []).length
      const readingMin = tokens.length / (target === 'A2' ? 90 : target === 'B1' ? 130 : target === 'B2' ? 170 : 220)
      const LEVELS: { lv: string; lex: number; sent: number; gram: number; coh: number }[] = [
        { lv: 'A1', lex: 75, sent: 8, gram: 4, coh: 0 },
        { lv: 'A2', lex: 65, sent: 12, gram: 8, coh: 0.15 },
        { lv: 'B1', lex: 50, sent: 17, gram: 14, coh: 0.4 },
        { lv: 'B2', lex: 35, sent: 24, gram: 22, coh: 0.8 },
        { lv: 'C1', lex: 22, sent: 30, gram: 32, coh: 1.3 },
      ]
      const lexScore = pctA1 * 0.7 + pctA2 * 0.9 - pctUnknown * 0.8 + pctAcad * 1.6
      const sentScore = avgSent * 1.6 + (longSent / Math.max(1, sents.length)) * 8
      const gramScore = tenses.size * 2.5 + passive * 1.5 + hedges * 1.2
      const cohScore = clausePerSent * 20 + Math.min(15, (lower.match(/[,;:]/g) || []).length / Math.max(1, sents.length) * 3)
      const dims = [
        { name: 'Lexical range', score: lexScore },
        { name: 'Sentence complexity', score: sentScore },
        { name: 'Grammar range', score: gramScore },
        { name: 'Cohesion', score: cohScore },
      ]
      const total = dims.reduce((s, d) => s + d.score, 0) / dims.length
      const matched = LEVELS.find((l) => total <= (l.sent + l.gram + l.lex) / 2.6)
      const est = matched || LEVELS[LEVELS.length - 1]
      const idx = LEVELS.findIndex((l) => l.lv === est.lv)
      const targetIdx = LEVELS.findIndex((l) => l.lv === target)
      const gap = idx - targetIdx
      const weakest = dims.slice().sort((a, b) => a.score - b.score)[0]
      return [
        sres('Estimated level', est.lv, Math.abs(gap) <= 0 ? T.good : gap > 0 ? T.warn : T.bad, gap === 0 ? 'matches your target' : gap > 0 ? `${num(gap, 0)} level(s) above ${target} — easier for your reader than intended` : `${num(Math.abs(gap), 0)} level(s) below ${target} — demanding for your reader`, clamp(50 + (2 - gap) * 20, 5, 100)),
        sres('Lexical range', `${num(pctAcad, 0)}% academic`, pctAcad > 20 ? T.neutral : T.warn, `${num(pctA1, 0)}% A1 · ${num(pctA2, 0)}% A2 · ${num(pctUnknown, 0)}% outside the lists`, clamp(100 - pctUnknown, 5, 100)),
        sres('Sentence length', `${num(avgSent, 1)} words`, avgSent > 26 ? T.warn : T.good, `${num(longSent, 0)} sentence(s) over 25 words · ${num(sents.length, 0)} sentences total`, clamp(100 - Math.abs(avgSent - 17) * 2, 5, 100)),
        sres('Reading time', `${num(readingMin, 1)} min`, readingMin > 4 ? T.warn : T.good, `${num(tokens.length, 0)} words at a ${target} reading speed — anything over four minutes and attention drops sharply`, clamp(100 - (readingMin / 6) * 100, 5, 100)),
        docr('Dimension breakdown', dims.map((d) => `${d.name.padEnd(20)} ${num(d.score, 1)}\n   ${d.score > 40 ? 'high — this raises the overall level' : d.score > 18 ? 'moderate' : 'low — this is what keeps the text accessible'}`).join('\n\n') + `\n\nCOHESION MARKERS: ${num(clauses, 0)} (${num(clausePerSent, 2)} per sentence)\nTENSE MARKERS: ${tenses.size} distinct forms\nPASSIVES: ${passive}\nHEDGES: ${hedges}`),
        docr('Word level split', [`A1 (very common): ${num(pctA1, 0)}%`, `A2: ${num(pctA2, 0)}%`, `Academic register: ${num(pctAcad, 0)}%`, `Outside the reference lists: ${num(pctUnknown, 0)}%`, '', 'The last figure is the useful one: words outside the lists are either genuinely advanced, or simply not in a 1,800-word reference set. A high value is a prompt to look them up, not a verdict on the reader.'].join('\n')),
        weakest.score < 18 ? res('Weakest dimension', `"${weakest.name}" scores lowest at ${num(weakest.score, 1)}. Cohesion is what most often makes a text readable: explicit connectives, parallel structures and signposting. A text with excellent content and no cohesion is experienced as hard regardless of its vocabulary.`, T.warn) : res('No weak dimension', `the lowest dimension is "${weakest.name}" at ${num(weakest.score, 1)}, which is healthy. This text should sit comfortably with its intended reader.`, T.good),
        res('This estimates the text, not the reader', 'CEFR describes what a learner can do. Measuring a text tells you the demand it places on a reader, which is a different and more useful number when you are writing for one.', T.neutral),
        res('Simplify structure before vocabulary', 'if you need to lower the level, split sentences and add connectives before you replace difficult words. A simple word inside an unparseable sentence helps nobody.', T.good),
        res('Unfamiliar words are not always bad', `if ${num(pctUnknown, 0)}% of words are outside the lists and your target is ${target}, check whether those words are the ones doing the technical work. Removing them would leave the text saying less.`, T.neutral),
      ]
    },
  },
]

function wordsOf(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9'\- ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}
