module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	rootDir: './',
	moduleNameMapper: {
		'^src/(.*)\\.js$': '<rootDir>/src/$1.ts',
	},
	testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/main.ts'],
	coverageDirectory: 'coverage',
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				tsconfig: {
					module: 'commonjs',
					target: 'esnext',
				},
			},
		],
	},
};
