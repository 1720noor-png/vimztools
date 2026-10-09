const { execSync } = require('child_process');

function run(cmd) {
  console.log(`> ${cmd}`);
  const out = execSync(cmd, { cwd: 'c:\\Users\\ranah\\OneDrive\\Desktop\\vimztools', encoding: 'utf8' });
  console.log(out);
}

run('git add .');
run('git commit -m "feat(redesign): complete premium UI/UX redesign with violet brand system and colored cards"');
run('git push origin main');
