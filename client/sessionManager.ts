// import _packageJson from 'package-json';

// Maximum number of pyright versions to return to the caller.
const maxPyrightVersionCount = 50;

export const packageName = 'browser-basedpyright'

const packageJson = async (packageName: string) => (await fetch(`https://registry.npmjs.org/${packageName}`)).json()

export async function getPyrightVersions(): Promise<string[]> {
    return packageJson(packageName)
        .then((response) => {
            let versions = Object.keys(response.versions);

            // filter out canary versions (unless there are only canary versions)
            const releaseVersions = versions.filter((verion) => !verion.includes('-'));
            if (releaseVersions.length) {
                versions = releaseVersions
            }

            // Return the latest version first.
            versions = versions.reverse();

            // Limit the number of versions returned.
            versions = versions.slice(0, maxPyrightVersionCount);

            return versions;
        })
        .catch((err) => {
            throw new Error(`Failed to get versions of pyright: ${err}`);
        });
}
