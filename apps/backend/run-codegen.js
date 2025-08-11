const getSpecs = require('./fetch-specs');
const { generateCodeFromSpec } = require('./ptlc'); // adjust import based on your Week 1

getSpecs(specs => {
  specs.forEach(spec => {
    console.log(`Generating for spec: ${spec.id}`);
    const specObj = JSON.parse(spec.spec); // or correct column name
    generateCodeFromSpec(specObj); // you’ll adapt this to your PTL logic
  });
});

