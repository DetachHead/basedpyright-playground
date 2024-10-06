// import _packageJson from 'package-json';

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

            return versions;
        })
        .catch((err) => {
            throw new Error(`Failed to get versions of pyright: ${err}`);
        });
}
