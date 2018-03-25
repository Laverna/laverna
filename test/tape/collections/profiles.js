/**
 * @file Test collections/Profiles
 */
import test from 'tape';
import '../../../app/scripts/utils/underscore';
import Profiles from '../../../app/scripts/collections/Profiles';
import Profile from '../../../app/scripts/models/Profile';

test('collections/Profiles: model', t => {
    t.equal(Profiles.prototype.model, Profile);
    t.end();
});

test('collections/Profiles: constructor()', t => {
    const prof = new Profiles();
    t.equal(prof.profileId, 'default', 'profileId is always equal to "default"');
    t.end();
});
